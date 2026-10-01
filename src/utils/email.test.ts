import { isValidEmail } from './email';

describe('isValidEmail', () => {
  test.each(['rica@alibe.com', 'nome.sobrenome@edu.pucrs.br'])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  test.each(['', 'rica', 'rica@alibe', 'rica @alibe.com', '@alibe.com', 'rica@.com'])(
    'rejects "%s"',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    }
  );
});
