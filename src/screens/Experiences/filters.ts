import type { FilterGroup } from '@/components/FilterSheet';

export const CATEGORY_TAGS = [
  { id: 'recommended', label: 'Recomendados' },
  { id: 'restaurant', label: 'Restaurantes' },
  { id: 'class', label: 'Aulas' },
  { id: 'bar', label: 'Bares' },
];

export const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'distance',
    title: 'Distância',
    options: [
      { value: '5', label: 'Até 5 km' },
      { value: '10', label: 'Até 10 km' },
      { value: 'any', label: 'Qualquer distância' },
    ],
  },
  {
    key: 'period',
    title: 'Horário',
    options: [
      { value: 'morning', label: 'Manhã' },
      { value: 'afternoon', label: 'Tarde' },
      { value: 'night', label: 'Noite' },
    ],
  },
  {
    key: 'environment',
    title: 'Ambiente',
    options: [
      { value: 'outdoor', label: 'Ao ar livre' },
      { value: 'indoor', label: 'Ambiente fechado' },
    ],
  },
  {
    key: 'idealFor',
    title: 'Ideal para',
    options: [
      { value: 'pair', label: 'Dupla' },
      { value: 'small', label: 'Grupo pequeno' },
      { value: 'large', label: 'Grupo grande' },
    ],
  },
];
