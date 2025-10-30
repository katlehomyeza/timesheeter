
export function checkAuth(): boolean {
  const token = localStorage.getItem('authToken');
  return !!token;
}

export async function logout(): Promise<void> {
  localStorage.removeItem("authToken");
  window.location.href = "/landing";
}
