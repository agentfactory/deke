import { isValidContactName, stripTitlePrefix } from '../name-validator'

describe('isValidContactName', () => {
  it('accepts valid two-word names', () => {
    expect(isValidContactName('Jane Smith')).toBe(true)
    expect(isValidContactName('John Lee')).toBe(true)
    expect(isValidContactName('Kim O\'Brien')).toBe(true)
  })

  it('accepts valid three-word names', () => {
    expect(isValidContactName('Mary Lou Henderson')).toBe(true)
    expect(isValidContactName('Jean Pierre Dupont')).toBe(true)
  })

  it('rejects empty or blank strings', () => {
    expect(isValidContactName('')).toBe(false)
    expect(isValidContactName('  ')).toBe(false)
  })

  it('rejects street addresses', () => {
    expect(isValidContactName('Greenview Ave Ottawa')).toBe(false)
    expect(isValidContactName('Main Street')).toBe(false)
    expect(isValidContactName('Oak Blvd')).toBe(false)
    expect(isValidContactName('Park Road')).toBe(false)
  })

  it('rejects navigation/menu text', () => {
    expect(isValidContactName('Broadway Videos Media Menu Welcome')).toBe(false)
    expect(isValidContactName('Home About')).toBe(false)
    expect(isValidContactName('Login Search')).toBe(false)
  })

  it('rejects too many words (>3)', () => {
    expect(isValidContactName('One Two Three Four')).toBe(false)
    expect(isValidContactName('Some Long Navigation Text Here')).toBe(false)
  })

  it('rejects single-word non-names', () => {
    expect(isValidContactName('Contact')).toBe(false)
    expect(isValidContactName('Admin')).toBe(false)
    expect(isValidContactName('Choir')).toBe(false)
    expect(isValidContactName('Music')).toBe(false)
  })

  it('accepts single-word proper names', () => {
    expect(isValidContactName('Katarina')).toBe(true)
    expect(isValidContactName('Deke')).toBe(true)
  })

  it('allows Dr at start (honorific, not drive)', () => {
    expect(isValidContactName('Dr Smith')).toBe(true)
  })

  it('rejects Drive in non-first position', () => {
    expect(isValidContactName('Oak Drive')).toBe(false)
  })
})

describe('stripTitlePrefix', () => {
  it('strips Treasurer prefix', () => {
    const result = stripTitlePrefix('Treasurer Katarina Michalyshyn')
    expect(result.name).toBe('Katarina Michalyshyn')
    expect(result.title).toBe('Treasurer')
  })

  it('strips President prefix', () => {
    const result = stripTitlePrefix('President John Lee')
    expect(result.name).toBe('John Lee')
    expect(result.title).toBe('President')
  })

  it('strips Vice President prefix', () => {
    const result = stripTitlePrefix('Vice President Sarah Jones')
    expect(result.name).toBe('Sarah Jones')
    expect(result.title).toBe('Vice President')
  })

  it('strips Director prefix', () => {
    const result = stripTitlePrefix('Director Maria Santos')
    expect(result.name).toBe('Maria Santos')
    expect(result.title).toBe('Director')
  })

  it('returns original name when no prefix', () => {
    const result = stripTitlePrefix('Jane Smith')
    expect(result.name).toBe('Jane Smith')
    expect(result.title).toBeNull()
  })

  it('does not strip prefix if nothing remains', () => {
    const result = stripTitlePrefix('Treasurer')
    expect(result.name).toBe('Treasurer')
    expect(result.title).toBeNull()
  })

  it('handles empty/null-ish input', () => {
    const result = stripTitlePrefix('')
    expect(result.name).toBe('')
    expect(result.title).toBeNull()
  })

  it('normalizes title casing', () => {
    const result = stripTitlePrefix('treasurer jane doe')
    expect(result.title).toBe('Treasurer')
    expect(result.name).toBe('jane doe')
  })
})
