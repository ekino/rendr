// @flow

import React from 'react';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';

import { store } from '../redux/index';

import {
  InitialisingScreen,
  BlogScreen,
  DefaultScreen,
  PageScreen
} from '../screens';

import {
  INITIALISING_SCREEN,
  BLOG_SCREEN,
  DEFAULT_SCREEN,
  PAGE_SCREEN,
} from './Screens';


function WrappedComponent(Component) {
  
  return function inject(props) {
    const EnhancedComponent = () => (
        <Component
          {...props}
        />
    );

    return <EnhancedComponent />;
  };
}

export default function () {
  Navigation.registerComponentWithRedux(
    INITIALISING_SCREEN,
    () => WrappedComponent(InitialisingScreen),
    Provider,
    store,
  );
  // Navigation.registerComponent(BLOG_SCREEN, () => WrappedComponent(BlogScreen));
  // Navigation.registerComponent(DEFAULT_SCREEN, () => WrappedComponent(DefaultScreen));
  // Navigation.registerComponent(PAGE_SCREEN, () => WrappedComponent(PageScreen));
  console.info('All screens have been registered...');
}
