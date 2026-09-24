/** Formats digits into +7 (XXX) XXX-XX-XX. Local part may start with 7 (Kazakhstan) or 9 (Russia). */
export function formatPhoneMask(value: string, previousValue = ''): string {
  const previousDigits = extractDigits(previousValue)
  let digits = extractDigits(value)

  // Backspace/Delete hit a mask character — also remove one digit
  if (
    previousValue.length > value.length &&
    digits.length === previousDigits.length &&
    previousDigits.length > 0
  ) {
    digits = previousDigits.slice(0, -1)
  }

  const normalized = normalizeCountryCode(digits, previousValue)
  if (normalized.length === 0) {
    return ''
  }

  const local = normalized.slice(1).slice(0, 10)

  // Keep +7 visible so the next typed digit can be 7 (KZ operator codes 700–778)
  if (local.length === 0) {
    return '+7 ('
  }

  let result = `+7 (${local.slice(0, 3)}`
  if (local.length >= 3) {
    result += ')'
  }
  if (local.length > 3) {
    result += ` ${local.slice(3, 6)}`
  }
  if (local.length > 6) {
    result += `-${local.slice(6, 8)}`
  }
  if (local.length > 8) {
    result += `-${local.slice(8, 10)}`
  }

  return result
}

export function getPhoneDigits(value: string): string {
  const digits = extractDigits(value)
  if (digits.length === 11 && digits.startsWith('8')) {
    return `7${digits.slice(1)}`
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return digits
  }
  if (digits.length === 10 && !digits.startsWith('7') && !digits.startsWith('8')) {
    return `7${digits}`
  }
  return normalizeCountryCode(digits).slice(0, 11)
}

export function isValidRussianPhone(value: string): boolean {
  const digits = extractDigits(value)
  return (
    digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))
  )
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function normalizeCountryCode(digits: string, previousValue = ''): string {
  if (digits.length === 0) {
    return ''
  }

  // Trunk prefix 8 → country code 7
  if (digits === '8') {
    return '7'
  }
  if (digits.startsWith('8') && digits.length >= 11) {
    return `7${digits.slice(1, 11)}`
  }

  if (digits.length >= 11) {
    if (digits.startsWith('7')) {
      return digits.slice(0, 11)
    }
    return `7${digits}`.slice(0, 11)
  }

  // 10 digits: paste of a national number (9XX… or 7XX…) vs typing with +7 already shown
  if (digits.length === 10) {
    if (digits.startsWith('7') && previousValue.length > 0) {
      return digits
    }
    return `7${digits}`
  }

  if (digits.startsWith('7')) {
    return digits
  }

  return `7${digits}`.slice(0, 11)
}
