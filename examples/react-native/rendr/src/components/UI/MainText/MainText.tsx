// Core modules.
import React from 'react';
import {Text} from 'react-native';

interface Props {
  children: any;
  style?: Object;
  testId?: string;
}

const MainText = ({children, style}: Props) => (
  <Text allowFontScaling={false} style={style}>
    {children}
  </Text>
);

export default MainText;
