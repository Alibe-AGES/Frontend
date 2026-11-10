import { API_BASE_URL } from '@/constants';
import { resolveApiImageUrl } from './apiImageUrl';

describe('resolveApiImageUrl', () => {
  test('prefixes API paths with the base URL', () => {
    expect(resolveApiImageUrl('/users/user-1/profile-picture')).toBe(
      `${API_BASE_URL}/users/user-1/profile-picture`
    );
  });

  test('keeps absolute URLs', () => {
    expect(resolveApiImageUrl('https://cdn.alibe.com/ana.jpg')).toBe(
      'https://cdn.alibe.com/ana.jpg'
    );
  });

  test('returns null when there is no image', () => {
    expect(resolveApiImageUrl(null)).toBeNull();
    expect(resolveApiImageUrl(undefined)).toBeNull();
    expect(resolveApiImageUrl('')).toBeNull();
  });
});
