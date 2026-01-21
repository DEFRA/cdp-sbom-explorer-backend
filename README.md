# cdp-sbom-explorer-backend

Microservice for importing and indexing SBOMs.

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Testing](#testing)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Update dependencies](#update-dependencies)
  - [Formatting](#formatting)
    - [Windows prettier issue](#windows-prettier-issue)
- [API endpoints](#api-endpoints)
- [Development helpers](#development-helpers)
  - [Proxy](#proxy)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
  - [Dependabot](#dependabot)
  - [SonarCloud](#sonarcloud)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Use `nvm` and `npm` to install the correct versions of Node & the project dependencies

```bash
nvm use
npm i
```

## Local development

### Postgres

Unlike the other platform services, cdp-sbom-explorer-backend uses Postgres.
To start postgresql locally and apply the latest liquibase schema, start the `compose.db.yml` file:

```bash
$ docker compose -f compose.db.yml up -d
```

For unit tests, the project uses `pg-mem` to test some of the database calls. This requires a separate copy of the schema (`schema.sql`) as a sql file.
To keep this up-to-date you can regenerate with the following command.

```bash
$ docker exec -it -e PGPASSWORD=password  cdp-sbom-explorer-backend-postgres-1 pg_dump -U postgres -d cdp_sbom_explorer_backend --schema-only --no-owner --no-acl --disable-triggers --no-comments --no-publications --no-security-labels --no-subscriptions --no-tablespaces > schema.sql
```

This requires postgres to be running via docker and the liquibase schema applied.

### Localstack

To test imports locally, localstack can be used.
It requires the following items to be provisioned:

- S3 bucket
- SQS Queue for bucket notifications
- Bucket notification to be enabled and configured to send to the queue

When running locally ensure the following:

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_KEY` are set up to use the localstack creds
- `S3_ENDPOINT` and `SQS_ENDPOINT` are set and pointing at localstack

## API endpoints

| Endpoint          | Description                                 |
| :---------------- | :------------------------------------------ |
| `GET: /health`    | Health                                      |
| `POST: /backfill` | Triggers the backfill job                   |
| `POST: /import`   | Imports a specific file (params key=s3 key) |

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
