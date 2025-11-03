import API from "../utils/api";

export async function handleGoogleAuthentication(): Promise<{ token: string; user: any }> {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      'http://localhost:4000/api/auth/google',
      'Google Sign In',
      'width=500,height=600'
    );

    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:4000') return;

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
  if (!token) {
    return false;
  } else  {
    try {
        const data = await API.post("/auth/validate",{token})
        return data.valid;
    } catch (error) {
      clearAuthTokens();
      console.error('Invalid token:', error);
      return false;
    }
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    return false;
  } else {
    try {
      const data =await API.post("/auth/refresh",{refreshToken})
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearAuthTokens();
      return false;
    }
  }
}

export function clearAuthTokens(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}