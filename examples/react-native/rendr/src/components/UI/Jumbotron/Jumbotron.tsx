import React from 'react';
import { View, Text } from 'react-native';

import styles from "./styles";

interface Props {
    settings?: {
        title?: String;
        message?: String;
    };
}

export default class Jumbotron extends React.Component<Props> {
    render() {
        const {
            settings: {
                title,
                message
            }
        } = this.props;

        return (
            <View style={styles.container}>
                <Text style={styles.header}>{title}</Text>
                <Text style={styles.content}>{message}</Text>
            </View>
        );
    }
}
