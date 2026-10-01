import { DayScreen } from '@/screens/Day';
import { EventCreatedScreen } from '@/screens/EventCreated';
import { ExperiencesScreen } from '@/screens/Experiences';
import { MemoriesScreen } from '@/screens/Memories';
import { NewExperienceScreen } from '@/screens/NewExperience';
import { NewMemoryScreen } from '@/screens/NewMemory';
import { render } from '@testing-library/react-native';
import { WelcomeScreen } from './index';

describe('welcome-based screens', () => {
  test.each([
    ['Day', DayScreen],
    ['Event created', EventCreatedScreen],
    ['Experiences', ExperiencesScreen],
    ['Memories', MemoriesScreen],
    ['New experience', NewExperienceScreen],
    ['New memory', NewMemoryScreen],
  ])('renders the %s screen label', async (name, Screen) => {
    const { getByText } = await render(<Screen />);

    expect(getByText(`Welcome to screen ${name}`)).toBeTruthy();
  });

  test('renders a custom screen name', async () => {
    const { getByText } = await render(<WelcomeScreen name="Custom" />);

    expect(getByText('Welcome to screen Custom')).toBeTruthy();
  });
});
