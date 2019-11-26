import { Navigation } from 'react-native-navigation';

import {INITIALISING_SCREEN, RENDR_SCREEN} from './Screens';
import registerScreens from './registerScreens';

// Register all screens on launch
registerScreens();

export function pushInitialisingScreen() {
  Navigation.setDefaultOptions({
    topBar: {
      background: {
        color: '#039893',
      },
      title: {
        color: 'white',
      },
      backButton: {
        title: '', // Remove previous screen name from back button
        color: 'white',
      },
      buttonColor: 'white',
    },
    statusBar: {
      style: 'light',
    },
    layout: {
      orientation: ['portrait'],
    },
    bottomTabs: {
      titleDisplayMode: 'alwaysShow',
    },
    bottomTab: {
      textColor: 'gray',
      selectedTextColor: 'black',
      iconColor: 'gray',
      selectedIconColor: 'black',
    },
  });

  Navigation.setRoot({
    root: {
      // sideMenu: {

      // },
      stack: {
        children: [
          {
            component: {
              name: INITIALISING_SCREEN,
              options: {
                topBar: {
                  visible: false,
                },
                statusBar: {
                  style: 'dark',
                },
              },
            },
          },
        ],
      },
    },
  });
}

export function pushWrapperScreen(page) {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: RENDR_SCREEN,
              passProps: {
                page,
              },
              options: {
                topBar: {
                  visible: false,
                },
                statusBar: {
                  style: 'dark',
                },
              },
            },
          },
        ],
      },
    },
  });
}
