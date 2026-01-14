/**
 * Turns a 3 or
 * @param {string} version
 * @return {bigint}
 */
function semverToBigint(version) {
  if (typeof version !== 'string') return 0n
  const main = version.split(/[+-]/, 1)[0]
  const numericSegments = main
    .split('.')
    .map((seg) => seg.match(/\d+/)?.[0])
    .filter((seg) => seg !== undefined)
    .map((seg) => Number(seg))

  if (numericSegments.length === 0) return 0n
  const parts = numericSegments
    .slice(0, 4)
    .map((n) => (Number.isFinite(n) ? n : 0))

  const clamp16 = (n) => Math.max(0, Math.min(0xffff, n | 0))
  const clampExtra = (n) => Math.max(0, Math.min(0x7fff, n | 0))

  if (numericSegments.length < 3) {
    while (numericSegments.length < 3) {
      numericSegments.push(0)
    }
  }

  if (numericSegments.length === 3) {
    const [major, minor, patch] = parts
    return (
      (BigInt(clamp16(major)) << 32n) |
      (BigInt(clamp16(minor)) << 16n) |
      BigInt(clamp16(patch))
    )
  }

  if (numericSegments.length === 4) {
    const [extra, major, minor, patch] = parts
    return (
      (BigInt(clampExtra(extra)) << 48n) |
      (BigInt(clamp16(major)) << 32n) |
      (BigInt(clamp16(minor)) << 16n) |
      BigInt(clamp16(patch))
    )
  }

  return 0n
}

export { semverToBigint }
