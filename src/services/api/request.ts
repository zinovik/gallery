import { API_URL } from '../../constants';

export const request = async (
  path: string,
  method?: 'POST',
  body?: object
): Promise<any | null> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: method || 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const accessToken = response.headers.get('access-token');

  if (accessToken) {
    localStorage.setItem('access_token', accessToken);
  }

  const responseJson = await response.json();

  return response.status < 400 ? responseJson : null;
};
