/**
 * Detects the package type from a SBOM component.
 * Assumes a cycloneDX style component layout.
 * Will use the syft:package:type property if set, otherwise falling back to
 * the package URL (purl).
 * @param {{properties: {name: string, value: string}[], purl: string|null}} component
 * @return {string}
 */
function getPackageType(component) {
  const props = Array.isArray(component.properties) ? component.properties : []
  const propType = props.find((p) => p.name === 'syft:package:type' && p.value)
  if (propType) return String(propType.value)
  if (component.purl) {
    const match = String(component.purl).match(/^pkg:([^/]+)/)
    if (match) return match[1]
  }
  return 'unknown'
}

export { getPackageType }
