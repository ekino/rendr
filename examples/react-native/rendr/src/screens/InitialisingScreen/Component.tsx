// Core modules.
import React from 'react';
import {ActivityIndicator} from 'react-native';

// Styles.
import {color} from '../../theme';
import styles from './styles';

export default class Initialising extends React.Component {
  render() {
    return (
      <ActivityIndicator
        style={styles.activityIndicator}
        color={color.primary}
      />
    );
  }
}
