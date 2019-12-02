// Core modules.
import React from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';

// Components.
import MainText from '../MainText/MainText';

// Styles.
import styles from './styles';

interface Props {
  active?: Boolean;
  onPress(): any;
  style?: Object;
  title: string;
}

const MenuItem = (style, title, active) => (
  <MainText
    testId={active ? "active" : null}
    style={[
      style ? style : null,
      styles.item,
      active ? styles.active : null
    ]}>{title}</MainText>
);

class MenuLink extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const {active, onPress, style, title} = this.props;

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View>{MenuItem(style, title, active)}</View>
      </TouchableWithoutFeedback>
    );
  }
}

export default MenuLink;
