import { API_URL } from '../../constants';
import { checkIsCookieRestrictedBrowser } from '../checkIsCookieRestrictedBrowser';

export const request = async (path: string, method?: 'POST', body?: object) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: method || 'GET',
    headers: {
      Authorization: checkIsCookieRestrictedBrowser(navigator.userAgent)
        ? `Bearer ${localStorage.getItem('access_token')}`
        : localStorage.getItem('csrf') || '',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    credentials: 'include',
  });

  const responseJson = await response.json();

  return [responseJson, response.status];
};
