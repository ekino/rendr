/**
 * @format
 */

import { Navigation } from 'react-native-navigation';
import { pushInitialisingScreen } from './src/navigation';

Navigation.events().registerAppLaunchedListener(() => pushInitialisingScreen());
