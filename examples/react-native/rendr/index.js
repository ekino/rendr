/**
 * @format
 */

import {Navigation} from 'react-native-navigation';
import {pushInitialisingScreen} from './src/navigation';
import {navigate} from './src/_rendr';

console.ignoredYellowBox = ['Remote debugger', 'Warning: isMounted(...) is deprecated'];

Navigation.events().registerAppLaunchedListener(async () => {
    pushInitialisingScreen();

    await navigate('/');

});