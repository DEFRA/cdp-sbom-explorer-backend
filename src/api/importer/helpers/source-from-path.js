/**
 * Takes a (s3) url and extracts the name, version and stage from the path/names
 * A path must be structured as:
 * `{name}/{version}/sbom.json.gz` or `{name}/{version}/sbom.{stage}.json.gz`
 * Throws exceptions when path is invalid.
 * @param {string} pathname
 * @return {{name: string, version: string, stage: string}}
 */
function sourceFromPath(pathname) {
  const parts = pathname.split('/')
  if (parts.length !== 3) {
    throw new Error(
      `url did not follow naming convention 'name/version/sbom(.stage).json.gz': ${pathname}`
    )
  }

  const [name, version, sbom] = parts

  if (!name || !version || !sbom) {
    throw new Error(
      `url did not follow naming convention 'name/version/sbom(.stage).json.gz': ${pathname}`
    )
  }

  if (sbom.startsWith('sbom.') && sbom.endsWith('json.gz')) {
    // default runnable artifact
    if (sbom === 'sbom.json.gz') {
      return {
        name,
        version,
        stage: 'run'
      }
    }

    // build stage artifact
    const sbomParts = sbom.split('.')
    if (sbomParts.length < 2) {
      throw new Error(`failed to extract stage name from ${sbom}`)
    }

    return {
      name,
      version,
      stage: sbomParts[1]
    }
  } else {
    throw new Error(`invalid filename ${sbom}`)
  }
}

export { sourceFromPath }
