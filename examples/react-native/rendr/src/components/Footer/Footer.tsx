import React from 'react';
import { View, Text } from 'react-native';

import styles from './styles';

interface Props {

}

export default class Footer extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Footer</Text>
      </View>
    );
  }
}
