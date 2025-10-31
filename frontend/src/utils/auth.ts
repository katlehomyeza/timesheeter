import type {User} from "@shared/types/users.types";
import type { ErrorDetail } from "@shared/types/utility.types";

export function checkAuth(): boolean {
  const token = localStorage.getItem('authToken');
  return !!token;
}

export async function logout(): Promise<void> {
  localStorage.removeItem("authToken");
  window.location.href = "/landing";
}

export function retrieveUser(): Pick<User,"name"|"email"> | ErrorDetail{
  const user = localStorage.getItem("user");
  if( !user ){
    return {
      message: "User credentials could not be retrieved",
      detail: "Authentication failed to obtain your credentials. Please try logging in again."
    };
  }
  return JSON.parse(user);
}
