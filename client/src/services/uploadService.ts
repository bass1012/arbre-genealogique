const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const uploadPhoto = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(`${API_URL}/api/upload/photo`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'upload de la photo');
  }

  return response.json();
};

export const uploadPhotoBase64 = async (base64Image: string): Promise<{ url: string; publicId: string }> => {
  const response = await fetch(`${API_URL}/api/upload/photo/base64`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Image }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'upload de la photo');
  }

  return response.json();
};

export const deletePhoto = async (publicId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/upload/photo`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la suppression de la photo');
  }
};
