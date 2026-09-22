import { AuthScreen } from '@/screens/Auth';
import { CreateEventScreen } from '@/screens/CreateEvent';
import { CreateProfileScreen } from '@/screens/CreateProfile';
import { DayScreen } from '@/screens/Day';
import { EventCreatedScreen } from '@/screens/EventCreated';
import { ExperiencesScreen } from '@/screens/Experiences';
import { LoginScreen } from '@/screens/Login';
import { MemoriesScreen } from '@/screens/Memories';
import { NewExperienceScreen } from '@/screens/NewExperience';
import { NewMemoryScreen } from '@/screens/NewMemory';
import { SignUpScreen } from '@/screens/SignUp';
import { render } from '@testing-library/react-native';
import { WelcomeScreen } from './index';

describe('welcome-based screens', () => {
  test.each([
    ['Auth', AuthScreen],
    ['Create event', CreateEventScreen],
    ['Create profile', CreateProfileScreen],
    ['Day', DayScreen],
    ['Event created', EventCreatedScreen],
    ['Experiences', ExperiencesScreen],
    ['Login', LoginScreen],
    ['Memories', MemoriesScreen],
    ['New experience', NewExperienceScreen],
    ['New memory', NewMemoryScreen],
    ['Sign up', SignUpScreen],
  ])('renders the %s screen label', async (name, Screen) => {
    const { getByText } = await render(<Screen />);

    expect(getByText(`Welcome to screen ${name}`)).toBeTruthy();
  });

  test('renders a custom screen name', async () => {
    const { getByText } = await render(<WelcomeScreen name="Custom" />);

    expect(getByText('Welcome to screen Custom')).toBeTruthy();
  });
});
