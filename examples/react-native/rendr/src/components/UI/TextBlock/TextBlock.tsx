// Core modules.
import React from 'react';
import { View, Button, Text } from 'react-native';

// Components.
import {HTMLContainer} from '../../index';

// Styles.
import styles from "./styles";

interface Props {
    rawHtml?: Boolean;
    contents?: string;
}

export default class TextBlock extends React.Component<Props> {
    render() {
        const {rawHtml, contents} = this.props;

        return (
          <View style={styles.container}>
            {rawHtml ? (
              <HTMLContainer html={contents} />
            ) : (
              <Text>{contents}</Text>
            )}
          </View>
        );
    }
}
