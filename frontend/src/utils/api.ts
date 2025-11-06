import { refreshAccessToken } from "../services/auth.service";

const BASE_URL = 'http://localhost:4000/api';

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(response: Response, originalRequest: () => Promise<Response>) {
  if (!response.ok) {
    if (response.status === 401) {
       

      const newToken = await refreshAccessToken();
      if (newToken) {
        return await originalRequest();
      } else {
        localStorage.removeItem('authToken');
        window.location.href = '/landing';
      }


      
    }
    throw new Error(`Error: ${response.status}`);
  }
  return response.json();
}

const API = {
  get: (url: string) =>
    fetch(`${BASE_URL}${url}`, { headers: getHeaders() }).then((res) =>
      handleResponse(res, () => fetch(`${BASE_URL}${url}`, { headers: getHeaders() }))
    ),

  post: (url: string, data: any) =>
    fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) =>
      handleResponse(res, () =>
        fetch(`${BASE_URL}${url}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
      )
    ),

  put: (url: string, data: any) =>
    fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) =>
      handleResponse(res, () =>
        fetch(`${BASE_URL}${url}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
      )
    ),

  patch: (url: string, data: any) =>
    fetch(`${BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) =>
      handleResponse(res, () =>
        fetch(`${BASE_URL}${url}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
      )
    ),

  delete: (url: string) =>
    fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then((res) =>
      handleResponse(res, () =>
        fetch(`${BASE_URL}${url}`, {
          method: 'DELETE',
          headers: getHeaders(),
        })
      )
    ),
};

export default API;