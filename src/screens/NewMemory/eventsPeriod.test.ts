import { describeEventsPeriod } from './eventsPeriod';

describe('describeEventsPeriod', () => {
  test('names the month of the calendar', () => {
    expect(describeEventsPeriod({ month: 11, year: 2026 })).toEqual({
      emptyMessage: 'Nenhum evento em novembro',
      hint: 'A lista mostra os eventos que já aconteceram em novembro de 2026. Para outro mês, volte e troque o mês no calendário.',
    });
  });

  test('names the day when the list comes from one day', () => {
    expect(describeEventsPeriod({ month: 10, year: 2026 }, '2026-10-03')).toEqual({
      emptyMessage: 'Nenhum evento neste dia',
      hint: 'A lista mostra os eventos que já aconteceram em 3 de outubro de 2026. Para outro dia, volte e escolha o dia no calendário.',
    });
  });

  test('falls back to the month when the day is not a valid date', () => {
    expect(describeEventsPeriod({ month: 3, year: 2027 }, 'amanhã').emptyMessage).toBe(
      'Nenhum evento em março'
    );
  });
});
