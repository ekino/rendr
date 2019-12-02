// Core modules.
import React from 'react';
import {View} from 'react-native';

// Components.
import HTMLContainer from '../HTMLContainer/HTMLContainer';
import MainText from '../MainText/MainText';

// Styles.
import styles from './styles';

interface Props {
  rawHtml?: boolean;
  contents?: string;
}

const TextBlock = ({rawHtml, contents}: Props) => (
  <View style={styles.container}>
    {rawHtml ? (
      <HTMLContainer html={contents} />
    ) : (
      <MainText>{contents}</MainText>
    )}
  </View>
);

export default TextBlock;
