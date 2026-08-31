/** Formats digits into Russian phone mask: +7 (XXX) XXX-XX-XX */
export function formatPhoneMask(value: string, previousValue = ''): string {
  const previousDigits = extractDigits(previousValue)
  let digits = extractDigits(value)

  // Backspace/Delete hit a mask character ( ), space, - ) — also remove one digit
  if (
    previousValue.length > value.length &&
    digits.length === previousDigits.length &&
    previousDigits.length > 0
  ) {
    digits = previousDigits.slice(0, -1)
  }

  let normalized = normalizeCountryCode(digits).slice(0, 11)
  const local = normalized.slice(1)

  if (local.length === 0) {
    return ''
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
  return normalizeCountryCode(extractDigits(value)).slice(0, 11)
}

export function isValidRussianPhone(value: string): boolean {
  const digits = getPhoneDigits(value)
  return digits.length === 11 && digits.startsWith('7')
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function normalizeCountryCode(digits: string): string {
  if (digits.startsWith('8')) {
    return `7${digits.slice(1)}`
  }
  if (digits.length > 0 && !digits.startsWith('7')) {
    return `7${digits}`
  }
  return digits
}
