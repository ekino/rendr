// Core modules.
import React from 'react';
import { Navigation } from 'react-native-navigation';

// Screens.
import {
  InitialisingScreen,
  RendrScreen,
} from '../screens';

import {
  INITIALISING_SCREEN,
  RENDR_SCREEN
} from './Screens';

function WrappedComponent(Component) {
  return function inject(props) {
    const EnhancedComponent = () => <Component {...props} />;
    return <EnhancedComponent />;
  };
}

export default function () {
  Navigation.registerComponent(INITIALISING_SCREEN, () =>
    WrappedComponent(InitialisingScreen),
  );
  Navigation.registerComponent(RENDR_SCREEN, () =>
    WrappedComponent(RendrScreen),
  );
  console.info('All screens have been registered...');
}
