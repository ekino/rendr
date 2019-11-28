/**
 * @format
 */

import {Navigation} from 'react-native-navigation';
import {pushInitialisingScreen} from './src/navigation';
import {navigate} from './src/_rendr';

import LocalStorage from './src/utils/LocalStorage';

console.ignoredYellowBox = [
    'Remote debugger', 
    'Warning: isMounted(...) is deprecated', 
    'Warning: componentWillMount is deprecated',
    'Warning: componentWillUpdate is deprecated',
    'Warning: componentWillReceiveProps is deprecated',
];

Navigation.events().registerAppLaunchedListener(async () => {
    pushInitialisingScreen();
    
    LocalStorage.removeItem('pages');

    await navigate('/');
});