// Core modules.
import React from 'react';
import { TouchableWithoutFeedback, Text } from 'react-native';

// Components.

// Styles.
import styles from './styles';

interface Props {
    active?: Boolean;
    onPress(): any;
    style?: object;
    title: string;
}

export default class MenuLink extends React.Component<Props> {
    render() {
        const {active, onPress, style, title} = this.props;

        return (
          <TouchableWithoutFeedback onPress={onPress}>
            <Text style={[style, styles.item, active && styles.active]}>
              {title}
            </Text>
          </TouchableWithoutFeedback>
        );
    }
}
