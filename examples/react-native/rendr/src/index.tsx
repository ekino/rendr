// Core modules.
import {Navigation} from 'react-native-navigation';
import {YellowBox} from 'react-native';

// Navigation.
import {pushInitialisingScreen} from './navigation';
import {navigate} from './_rendr';

// Utils.
import LocalStorage from './utils/LocalStorage';

YellowBox.ignoreWarnings([
  'Remote debugger',
  'Warning: isMounted(...) is deprecated',
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillUpdate is deprecated',
  'Warning: componentWillReceiveProps is deprecated and will be removed in the next',
  'Warning: componentWillMount has been renamed, and is not recommended for use.',
]);

const App = () => {
  Navigation.events().registerAppLaunchedListener(async () => {
    pushInitialisingScreen();

    LocalStorage.removeItem('pages');

    await navigate('/');
  });
};

export default App;
