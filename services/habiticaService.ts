import type { HabiticaUser, HabiticaDaily } from '../types';

const API_BASE_URL = 'https://habitica.com/api/v3';

async function request<T,>(endpoint: string, user: HabiticaUser, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-user': user.userId,
    'x-api-key': user.apiToken,
    'x-client': 'd5edea78-6f44-43d6-83ef-fc9da1cbcae2-DailySurpriseApp'
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  const responseData = await response.json();
  return responseData.data as T;
}

export const createDaily = (user: HabiticaUser, task: HabiticaDaily): Promise<HabiticaDaily> => {
  return request<HabiticaDaily>('/tasks/user', user, {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const updateDailyNotes = (user: HabiticaUser, taskId: string, notes: string): Promise<HabiticaDaily> => {
  return request<HabiticaDaily>(`/tasks/${taskId}`, user, {
    method: 'PUT',
    body: JSON.stringify({ notes }),
  });
};

export const deleteDaily = (user: HabiticaUser, taskId: string): Promise<{}> => {
  return request<{}>(`/tasks/${taskId}`, user, {
    method: 'DELETE',
  });
};
