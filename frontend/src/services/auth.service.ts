import { BASE_ORIGIN, BASE_URL } from "../utils/api";

export async function handleGoogleAuthentication(): Promise<{ token: string; user: any }> {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      `${BASE_URL}/auth/google`,
      'Google Sign In',
      'width=500,height=600'
    );

    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== BASE_ORIGIN) return;

      if (event.data.token && event.data.user && event.data.refreshToken) {
        localStorage.setItem('authToken', event.data.token);
        localStorage.setItem('refreshToken', event.data.refreshToken);
        localStorage.setItem('user', event.data.user); // Stringify the object
        cleanup();
        resolve({ token: event.data.token, user: event.data.user }); // Resolve once with both
      } else if (event.data.error) {
        cleanup();
        reject(new Error(event.data.error));
      }
    };

    const handleBeforeUnload = () => {
      cleanup();
      reject(new Error('Authentication cancelled'));
    };

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!popup.closed) popup.close();
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener('beforeunload', handleBeforeUnload);
  });
}

export async function checkAuth(): Promise<boolean> {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const data = await fetch(`${BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then((res) => res.json());

    if (data.valid) return true;

    // Try refreshing token if invalid
    return await refreshAccessToken();
  } catch (error) {
    console.error('Token validation failed:', error);
    clearAuthTokens();
    return false;
  }
}

// Attempts to refresh tokens
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const data = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then((res) => res.json());

    if (data.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    }

    clearAuthTokens();
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearAuthTokens();
    return false;
  }
}

export function clearAuthTokens(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}