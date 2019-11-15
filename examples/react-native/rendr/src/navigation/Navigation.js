// @flow

import { Navigation } from 'react-native-navigation';

import {
  INITIALISING_SCREEN,
  BLOG_SCREEN,
  DEFAULT_SCREEN,
  PAGE_SCREEN,
} from './Screens';
import registerScreens from './registerScreens';

// Register all screens on launch
registerScreens();

export function pushInitialisingScreen(currentTabIndex = 0, visible = true) {
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
      stack: {
        children: [{
          component: {
            name: INITIALISING_SCREEN,
            options: {
              topBar: {
                visible: false,
              },
              statusBar: {
                style: 'dark'
              }
            }
          }
        }]
      }
    }
  });
}

export function pushDefaultScreen(currentTabIndex = 0, visible = true) {
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
      bottomTabs: {
        children: [{
          stack: {
            children: [{
              component: {
                name: DEFAULT_SCREEN,
                options: {
                  topBar: {
                    title: {
                      text: 'Home'
                    },
                  },
                  statusBar: {
                    style: 'dark'
                  },
                },
              },
            }],
            options: {
              bottomTab: {
                text: 'Home',
                icon: require('../assets/icons/ic_tab_home.png'),
                testID: 'FIRST_TAB_BAR_BUTTON',
              },
            },
          },
        },
        {
          stack: {
            children: [{
              component: {
                name: PAGE_SCREEN,
                passProps: {
                  route: 'about',
                },
                options: {
                  topBar: {
                    title: {
                      text: 'About'
                    },
                  },
                  statusBar: {
                    style: 'dark'
                  },
                },
              },
            }],
            options: {
              bottomTab: {
                text: 'About',
                icon: require('../assets/icons/ic_tab_menu.png'),
                testID: 'SECOND_TAB_BAR_BUTTON',
              },
            },
          },
        },
          {
            stack: {
              children: [{
                component: {
                  name: BLOG_SCREEN,
                  options: {
                    topBar: {
                      title: {
                        text: 'Blog'
                      },
                    },
                    statusBar: {
                      style: 'dark'
                    },
                  },
                },
              }],
              options: {
                bottomTab: {
                  text: 'Blog',
                  icon: require('../assets/icons/ic_tab_menu.png'),
                  testID: 'THIRD_TAB_BAR_BUTTON',
                },
              },
            },
          }],
        options: {
          topBar: {
            visible,
          },
          bottomTabs: {
            currentTabIndex,
          },
        },
      },
    },
    // root: {
    //   stack: {
    //     children: [{
    //       component: {
    //         name: DEFAULT_SCREEN,
    //         options: {
    //           topBar: {
    //             visible: false,
    //           },
    //           statusBar: {
    //             style: 'dark'
    //           }
    //         }
    //       }
    //     }]
    //   }
    // }
  });
}

export function pushBlogPostScreen(route, text) {
  Navigation.setRoot({
    root: {
      stack: {
        children: [{
          component: {
            name: BLOG_SCREEN,
            passProps: {
              route
            },
            options: {
              topBar: {
                title: {
                  text
                },
                leftButtons: [
                  {
                    id: 'nav_home_btn',
                    icon: require('../assets/icons/ic_tab_home.png'),
                    color: 'white'
                  }
                ]
              }
            }
          }
        }]
      }
    }
  });
}

export function pushPageScreenApp(route, text) {
  Navigation.setRoot({
    root: {
      stack: {
        children: [{
          component: {
            name: PAGE_SCREEN,
            passProps: {
              route
            },
            options: {
              topBar: {
                title: {
                  text
                },
                leftButtons: [
                  {
                    id: 'nav_home_btn',
                    icon: require('../assets/icons/ic_tab_home.png'),
                    color: 'white'
                  }
                ]
              }
            }
          }
        }]
      }
    }
  });
}
