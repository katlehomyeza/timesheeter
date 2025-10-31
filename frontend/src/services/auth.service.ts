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
      
      if (event.data.token && event.data.user) {
        localStorage.setItem('authToken', event.data.token);
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