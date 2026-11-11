export function formatNextEventDate(timeslot: string): string | null {
  const date = new Date(timeslot);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const day = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
  const hours = String(date.getUTCHours());
  const minutes = date.getUTCMinutes();
  const time = minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;

  return `${day.charAt(0).toUpperCase()}${day.slice(1)}, às ${time}`;
}
