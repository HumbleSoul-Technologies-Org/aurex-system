export interface CloudinaryResult {
  secure_url: string
  public_id: string
  [key: string]: any
}

/**
 * Upload an image File to Cloudinary using an unsigned upload preset.
 * Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to be set.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary environment variables: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)

  const res = await fetch(url, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Cloudinary upload failed: ${res.status} ${txt}`)
  }

  const data = (await res.json()) as CloudinaryResult
  return data
}
