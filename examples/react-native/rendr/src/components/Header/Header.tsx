// Core modules.
import React from 'react';
import {View} from 'react-native';

// Rendr.
import {navigate} from '../../_rendr';

// Components.
import {Link} from '../index';

// Styles.
import styles from './styles';


interface Props {}

export default class Header extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Link title="Home" onPress={() => navigate('/')} />
        <Link title="About" onPress={() => navigate('/about')} />
      </View>
    );
  }
}
