// Core modules.
import React from 'react';
import { View, Text } from 'react-native';

// Styles.
import styles from "./styles";

interface Props {
    title?: String;
    contents?: String;
}

export default class Jumbotron extends React.Component<Props> {
    render() {
        const {title, contents} = this.props;

        return (
          <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.contents}>{contents}</Text>
          </View>
        );
    }
}
