import api from '../api/client'
import { storeToken, removeToken } from './storage';

export async function loginLocal(email: string, password: string): Promise<boolean> {
  try {
    const { data } = await api.post<{ access_token: string }>('/auth/login', { email, password })
    await storeToken(data.access_token)
    return true
  } catch (err: any) {
    return false;
  }
}

export async function registerLocal(email: string, password: string): Promise<boolean> {
  try {
    await api.post('/auth/register', { email, password })
    return true
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  await removeToken();
}
