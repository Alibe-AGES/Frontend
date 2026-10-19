import { ServerPlace } from '../places';

const NAMES: [string, string][] = [
  ['Bloom Café', 'restaurant'],
  ['Cinepolis Shopping Central', 'recommended'],
  ['Pampa Grill Steakhouse', 'restaurant'],
  ['Arena Kart', 'recommended'],
  ['Sunset Rooftop', 'recommended'],
  ['Jump Park', 'recommended'],
  ['Aula de Cerâmica', 'class'],
  ['Estúdio de Yoga', 'class'],
];

export const MOCK_PLACES: ServerPlace[] = NAMES.map(([name, category], index) => ({
  id: `mock-place-${String(index + 1)}`,
  name,
  address: 'Endereço',
  photoUrl: null,
  category,
}));
