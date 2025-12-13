import { API_URL } from '../../constants';

export const request = async (path: string, method?: 'POST', body?: object) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: method || 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    credentials: 'include', // DEPRECATED
  });

  const responseJson = await response.json();

  return [responseJson, response.status];
};
