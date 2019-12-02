// Core modules.
import React from 'react';
import {Navigation} from 'react-native-navigation';

// Screens.
import {InitialisingScreen, RendrScreen, SideMenu, TopBar} from '../screens';
import {INITIALISING_SCREEN, RENDR_SCREEN, SIDE_MENU, TOP_BAR} from './Screens';

function WrappedComponent(Component) {
  return function inject(props) {
    const EnhancedComponent = () => <Component {...props} />;
    return <EnhancedComponent />;
  };
}

export default function() {
  Navigation.registerComponent(INITIALISING_SCREEN, () =>
    WrappedComponent(InitialisingScreen),
  );
  Navigation.registerComponent(RENDR_SCREEN, () =>
    WrappedComponent(RendrScreen),
  );
  Navigation.registerComponent(SIDE_MENU, () => WrappedComponent(SideMenu));
  Navigation.registerComponent(TOP_BAR, () => WrappedComponent(TopBar));
}
