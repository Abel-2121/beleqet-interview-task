import { api } from '@/lib/api';

/** Response shape returned by Cloudinary after a successful upload. */
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/** Upload a file to Cloudinary via a presigned signature and return the public URL. */
export async function uploadToCloudinary(
  file: File,
  folder = 'beleqet',
): Promise<string> {
  const sig = await api.getUploadSignature(file.name, file.type, folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  const response = await fetch(sig.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return data.secure_url;
}
