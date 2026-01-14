import { semverToBigint } from './semver-to-bigint.js'

describe('#semverToBigint', () => {
  /**
   * semVerToBigInt takes a semver string and packs it into a 64 bit int
   * For a normal 3 part sem ver string it stores each part as a 16 bit int
   * with patch in the least significant 16 bits, follows by min and maj.
   * e.g.
   * |blank|major|minor|patch|
   * |48-63|32-48|16-32| 0-16|
   */
  test('turns a maj.min.patch semver to bigint', () => {
    const result = semverToBigint('1.255.8')

    expect(result.toString(16)).toEqual(semverAsHex(1, 255, 8))

    expect(result & 0xffffn).toEqual(8n)
    expect((result >> 16n) & 0xffffn).toEqual(255n)
    expect((result >> 32n) & 0xffffn).toEqual(1n)
  })

  test('we can compare the bigInt version', () => {
    expect(semverToBigint('2.1.1')).toBeGreaterThan(semverToBigint('2.1.0'))
    expect(semverToBigint('2.1.0')).toBeGreaterThan(semverToBigint('2.0.0'))
    expect(semverToBigint('2.0.0')).toBeGreaterThan(semverToBigint('1.0.0'))

    expect(semverToBigint('10.0.0')).toBeGreaterThan(semverToBigint('2.0.0'))
    expect(semverToBigint('2.16.0')).toBeGreaterThan(
      semverToBigint('1.999.999')
    )

    expect(semverToBigint('1.0.0')).toBeLessThan(semverToBigint('2.0.0'))
    expect(semverToBigint('1.1.0')).toBeLessThan(semverToBigint('1.2.0'))
    expect(semverToBigint('1.1.1')).toBeLessThan(semverToBigint('1.1.2'))

    expect(semverToBigint('10.33.1')).toEqual(semverToBigint('10.33.1'))
  })

  /**
   * For extended version numbers with 4 parts, we store them more or less the same.
   * The key difference is that the 'extra' field is limited to 15 bits as we're using
   * a signed int, so the final bit is the +/- flag.
   *
   * |extra|major|minor|patch|
   * |48-63|32-48|16-32| 0-16|
   */
  test('turns a 4 part semver to bigint', () => {
    const result = semverToBigint('4.3.2.1')

    expect(result.toString(16)).toEqual('4000300020001')
    expect(result & 0xffffn).toEqual(1n)
    expect((result >> 16n) & 0xffffn).toEqual(2n)
    expect((result >> 32n) & 0xffffn).toEqual(3n)
    expect((result >> 48n) & 0xffffn).toEqual(4n)
  })

  /**
   * hex representation of a semver string
   * @param {number} maj
   * @param {number} min
   * @param {number} patch
   * @return {string}
   */
  function semverAsHex(maj, min, patch) {
    return (
      maj.toString(16) +
      min.toString(16).padStart(4, '0') +
      patch.toString(16).padStart(4, '0')
    )
  }
})
