// Simple typed API client example using fetch
// Usage example:
// import { getPosts, getPost, createPost } from '../server/api'
// const posts = await getPosts()

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface NewPost {
  userId: number;
  title: string;
  body: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const DEFAULT_BASE = 'https://jsonplaceholder.typicode.com';

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${DEFAULT_BASE}${path}`;
  const res = await fetch(url, opts);
  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || res.statusText || 'Request failed', res.status);
  }

  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  // Fallback: return raw text when not JSON
  return (await res.text()) as unknown as T;
}

export async function getPosts(): Promise<Post[]> {
  return request<Post[]>('/posts');
}

export async function getPost(id: number): Promise<Post> {
  return request<Post>(`/posts/${String(id)}`);
}

export async function createPost(payload: NewPost): Promise<Post> {
  return request<Post>('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updatePost(id: number, payload: Partial<NewPost>): Promise<Post> {
  return request<Post>(`/posts/${String(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deletePost(id: number): Promise<void> {
  await request(`/posts/${String(id)}`, { method: 'DELETE' });
}

export default {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
