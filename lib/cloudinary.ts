// Client-side only Cloudinary upload functionality
// No server-side imports to avoid build errors

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '');

    fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          reject(new Error(data.error.message));
        } else {
          resolve({
            public_id: data.public_id,
            secure_url: data.secure_url,
            width: data.width,
            height: data.height,
            format: data.format,
            resource_type: data.resource_type,
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('public_id', publicId);

    fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          reject(new Error(data.error.message));
        } else {
          resolve();
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

// Helper function to extract public_id from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/v\d+\/([^\/]+)\.[^\/]+$/);
  return match ? match[1] : null;
}; 