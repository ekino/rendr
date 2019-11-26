// Core modules.
import React from 'react';
import {Button, View} from 'react-native';

// Navigation.
import {navigate} from '../../_rendr';

// Styles.
import {color} from '../../theme';
import styles from './styles';

export default class Header extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={() => navigate('/')}
          title='Home'
          color={color.black}
        />
        <Button
          onPress={() => navigate('/about')}
          title='About'
          color={color.black}
        />
      </View>
    );
  }
}
