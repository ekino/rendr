// Core modules.
import React from 'react';
import {View} from 'react-native';

// Components.
import {Burger} from '../../components';

// Styles.
import styles from './styles';

class TopBar extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Burger />
      </View>
    );
  }
}

export default TopBar;
