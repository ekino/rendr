// Core modules.
import React from 'react';
import {Button} from 'react-native';

// Styles.
import {color} from '../../../theme';
import styles from './styles';

interface Props {
    title?: string;
    onPress(): any;
}

export default class Link extends React.Component<Props> {
    render() {
        const {title, onPress} = this.props;

        return <Button onPress={onPress} title={title} color={color.black} />;
    }
}
