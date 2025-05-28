import type { UserProfile } from '@swipe/shared'; // Your shared UserProfile type

const API_BASE_URL = 'http://localhost:3002/api'; // Your backend URL

export const getMyProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('authToken'); // Get token from localStorage

  if (!token) {
    throw new Error('No authentication token found. Please login.');
  }

  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Crucial: Include the JWT
    },
  });

  if (!response.ok) {
    // Try to parse error message from backend if available
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data: UserProfile = await response.json();
  return data;
};

export const updateMyProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
  
    const response = await fetch(`${API_BASE_URL}/profile/me`, { // Endpoint is PUT /api/profile/me
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  };