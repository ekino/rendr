/**
 * @format
 */

import { Navigation } from 'react-native-navigation';
import { pushDefaultScreen } from './src/navigation';

Navigation.events().registerAppLaunchedListener(() => pushDefaultScreen());