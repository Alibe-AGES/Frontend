import { buildMembersPreview } from './membersPreview';

const members = [
  { id: 'user-1', name: 'Ana' },
  { id: 'user-2', name: 'Bia' },
  { id: 'user-3', name: 'Kata' },
];

describe('buildMembersPreview', () => {
  test('shows the current user first as "Eu"', () => {
    expect(buildMembersPreview(members, 'user-2')).toBe('Eu, Ana, Kata');
  });

  test('lists every name when the current user is unknown or not a member', () => {
    expect(buildMembersPreview(members, undefined)).toBe('Ana, Bia, Kata');
    expect(buildMembersPreview(members, 'someone-else')).toBe('Ana, Bia, Kata');
  });

  test('returns undefined without members', () => {
    expect(buildMembersPreview([], 'user-1')).toBeUndefined();
  });
});
