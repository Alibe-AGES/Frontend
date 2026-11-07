import { getAuthRedirect } from './auth-routing';

test('redirects an unauthenticated app opening to the initial auth screen', () => {
  expect(getAuthRedirect('index', false, false, true)).toBe('/auth');
});

test('does not restore the login route when an unauthenticated app starts', () => {
  expect(getAuthRedirect('(auth)', false, false, true)).toBe('/auth');
});

test('redirects an authenticated app opening to groups', () => {
  expect(getAuthRedirect('index', true, false, true)).toBe('/groups');
});

test('keeps the loading route while the session request is pending', () => {
  expect(getAuthRedirect('index', false, true, true)).toBeNull();
});

test('keeps public authentication routes available after initialization', () => {
  expect(getAuthRedirect('(auth)', false, false)).toBeNull();
});

test('prevents an authenticated user from returning to login', () => {
  expect(getAuthRedirect('(auth)', true, false)).toBe('/groups');
});

test('allows an unauthenticated user to finish the profile setup', () => {
  expect(getAuthRedirect('(profile)', false, false)).toBeNull();
});

test('does not redirect an authenticated application route', () => {
  expect(getAuthRedirect('(app)', true, false)).toBeNull();
});
