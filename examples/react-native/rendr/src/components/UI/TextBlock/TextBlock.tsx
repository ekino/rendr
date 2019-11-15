// Core modules
import React from 'react';
import { View, Button, Text } from 'react-native';

// Components
import HTMLContainer from '../HTMLContainer/HTMLContainer';

// Styles
import styles from "./styles";

interface Props {
    settings?: {
        rawHtml?: Boolean;
        message?: string;
        link?: {
            href: string;
            title: string;
        }
    }, 
    text?: string;
}

export default class TextBlock extends React.Component<Props> {
    render() {
        const {
            settings: {
                rawHtml,
                message,
                link,
            },
        } = this.props;

        return (
            <View style={styles.container}>
                {rawHtml ? 
                    <HTMLContainer html={message} /> : 
                    <Text>{message}</Text>
                }
                {link && <Button title={link.title} onPress={() => alert("test")} />}
            </View>
        );
    }
}
