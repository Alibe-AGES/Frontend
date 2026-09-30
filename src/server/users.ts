import { request } from './api';

export interface UserMeResponse {
  id: string;
  name: string;
  email: string;
  completedEvents: number;
  eventsInDecision: number;
  createdAt: string;
  image: string | null;
}

export const getMyProfile = async (): Promise<UserMeResponse> => {
  return request<UserMeResponse>('/api/users/me', {
    method: 'GET',
  });
};
