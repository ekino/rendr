// Core modules
import React from 'react';
import { Dimensions, Linking } from 'react-native';
import HTML from 'react-native-render-html';

// Styles
import tags from './styles';


interface Props {
    html?: any;
}

export default class HTMLContainer extends React.Component<Props> {
    render() {
        const { html } = this.props;

        return (
            <HTML
                html={html}
                imagesMaxWidth={Dimensions.get("window").width}
                tagsStyles={tags}
                onLinkPress={(_evt, url) => {
                    Linking.openURL(url);
                }}
            />
        );
    }
}
