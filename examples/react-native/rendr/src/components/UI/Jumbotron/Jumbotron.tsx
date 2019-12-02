// Core modules.
import React from 'react';
import {View} from 'react-native';

// Components.
import MainText from '../MainText/MainText';

// Styles.
import styles from './styles';

interface Props {
  title?: string;
  contents?: string;
}

const Jumbotron = ({title, contents}: Props) => (
  <View style={styles.container}>
    {title && <MainText style={styles.title}>{title}</MainText>}
    {contents && <MainText style={styles.contents}>{contents}</MainText>}
  </View>
);

export default Jumbotron;
