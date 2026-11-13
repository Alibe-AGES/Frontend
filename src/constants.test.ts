import { resolveApiBaseUrl } from './constants';

describe('resolveApiBaseUrl', () => {
  test('uses the configured mobile API URL for Expo Go', () => {
    expect(resolveApiBaseUrl('http://localhost:3000', 'http://192.168.1.20:3000', 'ios')).toBe(
      'http://192.168.1.20:3000'
    );
  });

  test('keeps loopback URLs unchanged on web', () => {
    expect(resolveApiBaseUrl('http://localhost:3000', 'http://192.168.1.20:3000', 'web')).toBe(
      'http://localhost:3000'
    );
  });

  test('removes a trailing slash from the selected URL', () => {
    expect(resolveApiBaseUrl('http://localhost:3000/', undefined, 'web')).toBe(
      'http://localhost:3000'
    );
  });

  test('falls back to the web URL when no mobile URL is configured', () => {
    expect(resolveApiBaseUrl('http://localhost:3000', undefined, 'android')).toBe(
      'http://localhost:3000'
    );
  });
});
