
export function checkAuth(): boolean {
  const token = localStorage.getItem('authToken');
  return !!token;
}