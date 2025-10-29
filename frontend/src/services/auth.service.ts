// src/services/auth.service.ts
export async function handleGoogleAuthentication(): Promise<string> {
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
    // Listen for the token from popup
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== 'http://localhost:4000') return;
      
      if (event.data.token) {
        localStorage.setItem('authToken', event.data.token);
        cleanup();
        resolve(event.data.token);
      } else if (event.data.error) {
        cleanup();
        reject(new Error(event.data.error));
      }
    };

    // Listen for popup being closed manually
    const handleBeforeUnload = () => {
      cleanup();
      reject(new Error('Authentication cancelled'));
    };

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      popup.close();
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener('beforeunload', handleBeforeUnload);
  });
}