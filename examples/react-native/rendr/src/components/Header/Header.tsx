// Core modules.
import React from 'react';
import {View} from 'react-native';

// Components.
import {MainText} from '../index';

// Styles.
import styles from './styles';

interface Props {
  text?: string;
}

const Header = ({text}: Props) => (
  <View style={styles.container}>
    <MainText style={styles.header}>{text || 'Header'}</MainText>
  </View>
);

export default Header;
