import { API_URL } from '../../constants';

export const request = async (
  path: string,
  method?: 'GET' | 'POST',
  body?: object
) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: method || 'GET',
    headers: {
      Authorization: localStorage.getItem('csrf') || '',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    credentials: 'include',
  });

  const responseJson = await response.json();

  return [responseJson, response.status];
};
