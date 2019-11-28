// Core modules.
import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

// Navigation.
import { toggleLeftDrawer } from '../../../navigation'

// Styles.
import styles from './styles';

export default class Burger extends React.Component {
  render() {
    return (
      <TouchableWithoutFeedback onPress={() => toggleLeftDrawer()}>
        <View style={styles.bun}>
          {[...Array(3)].map((_e, i) => (
            <View key={i} style={styles.patty}/>
          ))}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
