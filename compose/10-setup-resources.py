#!/usr/bin/env python3

import json
import logging
import os
from pathlib import Path
from typing import Dict, Tuple

import boto3
from botocore.exceptions import ClientError, WaiterError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
LOGGER = logging.getLogger(__name__)


def ensure_queue(sqs_client, name: str, attributes: Dict[str, str] | None = None) -> Tuple[str, str]:
    attributes = attributes or {}
    try:
        queue_url = sqs_client.create_queue(QueueName=name, Attributes=attributes)["QueueUrl"]
        LOGGER.info("Created queue %s", name)
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "QueueAlreadyExists":
            raise
        queue_url = sqs_client.get_queue_url(QueueName=name)["QueueUrl"]
        LOGGER.info("Queue %s already exists", name)

    queue_arn = sqs_client.get_queue_attributes(
        QueueUrl=queue_url,
        AttributeNames=["QueueArn"],
    )["Attributes"]["QueueArn"]
    return queue_url, queue_arn


def ensure_topic(sns_client, name: str) -> str:
    try:
        topic_arn = sns_client.create_topic(Name=name)["TopicArn"]
        LOGGER.info("Created topic %s", name)
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "ResourceAlreadyExistsException":
            raise
        topic_arn = sns_client.create_topic(Name=name)["TopicArn"]
        LOGGER.info("Topic %s already exists", name)
    return topic_arn


def subscribe_queue_to_topic(sns_client, topic_arn: str, queue_arn: str, attributes: dict[str, str]) -> None:
    try:
        sns_client.subscribe(
            TopicArn=topic_arn,
            Protocol="sqs",
            Endpoint=queue_arn,
            Attributes=attributes # e.g. {"RawMessageDelivery": "true"},
        )
        LOGGER.info("Subscribed %s to %s", queue_arn, topic_arn)
    except ClientError as exc:
        if exc.response["Error"]["Code"] not in {"SubscriptionAlreadyExists", "InvalidParameter"}:
            raise
        LOGGER.info("Subscription for %s to %s already exists", queue_arn, topic_arn)


def ensure_bucket(s3_client, name: str, region: str) -> None:
    try:
        kwargs = {"Bucket": name}
        if region != "us-east-1":
            kwargs["CreateBucketConfiguration"] = {"LocationConstraint": region}
        s3_client.create_bucket(**kwargs)
        LOGGER.info("Created bucket %s", name)
    except ClientError as exc:
        if exc.response["Error"]["Code"] not in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
            raise
        LOGGER.info("Bucket %s already exists", name)


def ensure_secret(secrets_client) -> None:
    try:
        secrets_client.create_secret(
            Name="cdp/notify/backend/integration-keys/Platform",
            SecretString="abc123def456ghi789jkl012mno345pq",
        )
        LOGGER.info("Created notify backend secret")
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "ResourceExistsException":
            raise
        LOGGER.info("Notify backend secret already exists")


def ensure_session_table(dynamodb_client) -> None:
    table_name = "cdp-portal-frontend-session"
    try:
        dynamodb_client.describe_table(TableName=table_name)
        LOGGER.info("Table %s already exists", table_name)
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "ResourceNotFoundException":
            raise
        dynamodb_client.create_table(
            TableName=table_name,
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        LOGGER.info("Creating table %s", table_name)
        try:
            dynamodb_client.get_waiter("table_exists").wait(
                TableName=table_name,
                WaiterConfig={"Delay": 1, "MaxAttempts": 20},
            )
        except WaiterError:
            LOGGER.warning("Timed out waiting for table %s to become active; continuing", table_name)

    try:
        dynamodb_client.update_time_to_live(
            TableName=table_name,
            TimeToLiveSpecification={"Enabled": True, "AttributeName": "expiresAt"},
        )
        LOGGER.info("Ensured TTL is enabled on %s", table_name)
    except ClientError as exc:
        if exc.response["Error"]["Code"] not in {"ResourceInUseException", "ValidationException"}:
            raise
        LOGGER.info("TTL already configured for %s", table_name)


def configure_bucket_notifications(s3_client, bucket: str, queue_arn: str) -> None:
    s3_client.put_bucket_notification_configuration(
        Bucket=bucket,
        NotificationConfiguration={
            "QueueConfigurations": [
                {"QueueArn": queue_arn, "Events": ["s3:ObjectCreated:*"]},
            ]
        },
    )
    LOGGER.info("Configured notifications on %s -> %s", bucket, queue_arn)

def upload_sboms(s3_client, assets_dir: Path) -> None:
    docs_dir = assets_dir / "sboms"
    if not docs_dir.is_dir():
        LOGGER.warning("Documentation directory not found at %s; skipping", docs_dir)
        return

    for path in docs_dir.rglob("*"):
        if path.is_file():
            key = path.relative_to(docs_dir).as_posix()
            s3_client.upload_file(str(path), "cdp-documentation", key)
            LOGGER.info("Uploaded doc %s to s3://cdp-documentation/%s", path.name, key)


def main() -> None:
    region = os.getenv("AWS_REGION", "eu-west-2")
    endpoint = os.getenv("LOCALSTACK_URL", "http://localhost:4566")
    assets_dir = Path(os.getenv("LOCALSTACK_ASSETS_DIR", "/opt/code/localstack/assets"))

    LOGGER.info("Starting LocalStack bootstrap | region=%s endpoint=%s assets=%s", region, endpoint, assets_dir)

    session = boto3.session.Session(region_name=region)
    sqs_client = session.client("sqs", endpoint_url=endpoint)
    sns_client = session.client("sns", endpoint_url=endpoint)
    s3_client = session.client("s3", endpoint_url=endpoint)
    dynamodb_client = session.client("dynamodb", endpoint_url=endpoint)
    secrets_client = session.client("secretsmanager", endpoint_url=endpoint)

    queue_definitions: Dict[str, Dict[str, str]] = {
        "sbom-bucket-events": {},
    }

    topic_names = [
        "sbom-bucket-events",
    ]

    subscriptions = [
        ("sbom-bucket-events", "sbom-bucket-events", {}),
    ]

    bucket_names = [
        "cdp-management-sbom",
    ]

    LOGGER.info("Setting up queues and topics")
    queue_info: Dict[str, Dict[str, str]] = {}
    for queue_name, queue_attrs in queue_definitions.items():
        queue_url, queue_arn = ensure_queue(sqs_client, queue_name, queue_attrs)
        queue_info[queue_name] = {"url": queue_url, "arn": queue_arn}

    topic_arns: Dict[str, str] = {}
    for topic_name in topic_names:
        topic_arns[topic_name] = ensure_topic(sns_client, topic_name)

    for topic_name, queue_name, attributes in subscriptions:
        subscribe_queue_to_topic(
            sns_client,
            topic_arns[topic_name],
            queue_info[queue_name]["arn"],
            attributes
        )

    LOGGER.info("Setting up buckets")
    for bucket in bucket_names:
        ensure_bucket(s3_client, bucket, region)

    configure_bucket_notifications(
        s3_client,
        bucket="cdp-management-sbom",
        queue_arn=queue_info["sbom-bucket-events"]["arn"],
    )

    LOGGER.info("Uploading assets from %s", assets_dir)

    try:
        LOGGER.info(
            "Summary | queues=%s topics=%s buckets=%s tables=%s",
            len(sqs_client.list_queues().get("QueueUrls", [])),
            len(sns_client.list_topics().get("Topics", [])),
            len(s3_client.list_buckets().get("Buckets", [])),
        )
    except ClientError as exc:
        LOGGER.warning("Unable to collect summary: %s", exc)

    LOGGER.info("LocalStack resource setup complete")


if __name__ == "__main__":
    main()
