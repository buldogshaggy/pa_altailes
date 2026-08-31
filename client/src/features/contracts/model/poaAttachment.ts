import type { PowerOfAttorneyAttachment } from './types'

export const POA_ATTACHMENT_MAX_SIZE_BYTES = 5 * 1024 * 1024

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export function validatePoaAttachmentFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Допустимые форматы: PDF, JPG, PNG, DOC, DOCX'
  }
  if (file.size > POA_ATTACHMENT_MAX_SIZE_BYTES) {
    return `Размер файла не должен превышать ${formatFileSize(POA_ATTACHMENT_MAX_SIZE_BYTES)}`
  }
  return null
}

export function readPoaAttachment(file: File): Promise<PowerOfAttorneyAttachment> {
  return new Promise((resolve, reject) => {
    const validationError = validatePoaAttachmentFile(file)
    if (validationError) {
      reject(new Error(validationError))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Не удалось прочитать файл'))
        return
      }

      const base64Marker = ';base64,'
      const contentBase64 = result.includes(base64Marker)
        ? result.slice(result.indexOf(base64Marker) + base64Marker.length)
        : ''

      resolve({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || 'application/octet-stream',
        contentBase64,
      })
    }
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}

export function getPoaAttachmentDownloadUrl(attachment: PowerOfAttorneyAttachment): string {
  return `data:${attachment.contentType};base64,${attachment.contentBase64}`
}
