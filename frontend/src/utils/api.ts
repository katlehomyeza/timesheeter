const BASE_URL = 'http://localhost:4000/api';

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/landing';
    }
    throw new Error(`Error: ${response.status}`);
  }
  return response.json();
}

const API = {
  get: (url: string) =>
    fetch(`${BASE_URL}${url}`, { headers: getHeaders() }).then(handleResponse),

  post: (url: string, data: any) =>
    fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  put: (url: string, data: any) =>
    fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (url: string) =>
    fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

export default API;