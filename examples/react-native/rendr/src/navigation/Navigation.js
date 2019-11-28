// Core modules
import { Linking } from 'react-native';
import {Navigation} from 'react-native-navigation';

import {INITIALISING_SCREEN, RENDR_SCREEN, SIDE_MENU, TOP_BAR} from './Screens';
import registerScreens from './registerScreens';

import { navigate } from '../_rendr';
import { color } from '../theme';

// Register all screens on launch
registerScreens();

export function pushInitialisingScreen() {
  Navigation.setDefaultOptions({
    topBar: {
      background: {
        color: color.secondary,
      },
      title: {
        color: color.white,
      },
      backButton: {
        title: '', // Remove previous screen name from back button
        color: color.white,
      },
      buttonColor: color.white,
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
    // root: {
    //   stack: {
    //     children: [
    //       {
    //         component: {
    //           name: RENDR_SCREEN,
    //           passProps: {
    //             page,
    //           },
    //           options: {
    //             topBar: {
    //               visible: false,
    //             },
    //             statusBar: {
    //               style: 'dark',
    //             },
    //           },
    //         },
    //       },
    //     ],
    //   },
    // },
    root: {
      sideMenu: {
        left: {
          component: {
            name: SIDE_MENU,
            id: 'leftDrawer',
            passProps: {
              page,
            },
          },
        },
        center: {
          stack: {
            id: 'stackRoot',
            children: [
              {
                component: {
                  name: RENDR_SCREEN,
                  passProps: {
                    page,
                  },
                  options: {
                    topBar: {

                      component: {
                        name: TOP_BAR,
                        alignment: 'center',
                        passProps: {
                          page,
                        },
                      },
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
      },
    },
  });
}

export const toggleLeftDrawer = (visible = true) => {
  // analytics event to fire on success
  Navigation.mergeOptions('leftDrawer', {
    sideMenu: {
      left: {
        visible,
      },
    },
  });
};

export const onClick = {
  navigateToScreen: url => {
    // analytics event to fire on success
    navigate(url);
  },
  navigateToURL: url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        // analytics event to fire on success
        Linking.openURL(url);
      } else {
        alert(`Don't know how to open URL: ${url}`);
      }
    });
  }
};
