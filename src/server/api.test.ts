import { ApiError, createPost, deletePost, getPost, getPosts, updatePost } from './api';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

describe('ApiError', () => {
  test('stores the message and status', () => {
    const error = new ApiError('Unauthorized', 401);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Unauthorized');
    expect(error.status).toBe(401);
  });

  test('defaults the status to 500', () => {
    expect(new ApiError('Request failed').status).toBe(500);
  });
});

describe('API requests', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('gets a JSON collection from the default API', async () => {
    const posts = [{ userId: 1, id: 2, title: 'Title', body: 'Body' }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json; charset=utf-8' },
      json: () => Promise.resolve(posts),
    });

    await expect(getPosts()).resolves.toEqual(posts);
    expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts', {});
  });

  test('gets a post by id', async () => {
    const post = { userId: 1, id: 2, title: 'Title', body: 'Body' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(post),
    });

    await expect(getPost(2)).resolves.toEqual(post);
    expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/2', {});
  });

  test('creates a post with a JSON request body', async () => {
    const payload = { userId: 1, title: 'Title', body: 'Body' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ ...payload, id: 2 }),
    });

    await expect(createPost(payload)).resolves.toEqual({ ...payload, id: 2 });
    expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  });

  test('updates a post with a PUT request', async () => {
    const payload = { title: 'Updated' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ userId: 1, id: 2, title: 'Updated', body: 'Body' }),
    });

    await updatePost(2, payload);

    expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/2', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  });

  test('deletes a post', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => '' },
      text: () => Promise.resolve(''),
    });

    await expect(deletePost(2)).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/2', {
      method: 'DELETE',
    });
  });

  test('returns raw text when the response is not JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'text/plain' },
      text: () => Promise.resolve('created'),
    });

    await expect(getPosts()).resolves.toBe('created');
  });

  test('throws an ApiError with the response text and status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => 'text/plain' },
      text: () => Promise.resolve('Post not found'),
    });

    await expect(getPost(999)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Post not found',
      status: 404,
    });
  });
});
