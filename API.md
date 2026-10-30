# API

## GET /search

The search endpoint allows you to find services that use a specific dependency or range of dependencies.

### Query params

| name        | description                                                                                                          | example                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| name        | (Required) Name of dependency to search for.                                                                         | `pino` `node` `pg-pool`         |
| type        | What kind of dependency is it/which tool installed it.                                                               | `npm` `deb` `binary`            |
| version     | Exact version number of to search for.                                                                               | `1.0.22` `22.0.1-beta`          |
| gte         | Any version greater than or equal to this value. Use instead of `version`.                                           | `1.0.22`                        |
| lte         | Any version less than or equal to this value. Use instead of `version`.                                              | `1.22.0`                        |
| team        | Only show services owned by CDP team (see below).                                                                    | `platform` `air-quality`        |
| environment | Only show services deployed in this environment                                                                      | `dev` `test` `perf-test` `prod` |
| tag         | Filters by tag. Environment is an alias for this. Most recent builds are tagged as `latest`                          | `latest` `dev` `test` `prod     |
| stage       | Docker build stage. The final runnable image is always `run`. Useful for searching filtering out build dependencies. | `run` `development`             |
| limit       | Max results returned.                                                                                                | 1000                            |

The `team` parameter should map to the CDP team id rather than the display name. This is typically the display name, but lower case with any spaces replaced by `-`.

### Response

```json
[
  {
    "name": "my-service",
    "version": "0.1.0",
    "stage": "run",
    "depversion": "10.0.0-beta",
    "deptype": "npm",
    "labels": ["team:platform"],
    "tags": ["prod", "latest"]
  }
]
```

### Example usage:

**Scenario:** Finding services deployed in production that are using a library that hasn't been patched yet.

To find this we will want to filter by the dependency, a version range and restrict the results to just services deployed in `prod` and to the `run` stage (i.e. in the container that's running, not the build stages).

```text
/search?name=pino&type=npm&gte=10.0.0&lte=10.3.1&environment=prod&stage=run
```

**Scenario:** Finding users impacted by a supply chain attack.

In this scenario we are looking for any services that has touch the library at any point as the team may be impacted.

```text
/search?name=foo&type=npm&version=1.0.1.99
```

**Scenario:** Has my team updated their node js versions?

```text
/search?name=node&type=binary&team=platform
```
