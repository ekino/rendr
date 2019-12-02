// Core modules.
import React from 'react';
import {Dimensions, View} from 'react-native';
import HTML from 'react-native-render-html';

// Navigation.
import {onClick} from '../../../navigation';

// Styles.
import tags, {styles} from './styles';

interface Props {
  html?: any;
}

const HTMLContainer = ({html}: Props) => (
  <HTML
    html={html}
    imagesMaxWidth={Dimensions.get('window').width}
    tagsStyles={tags}
    onLinkPress={(_evt, url) => {
      onClick.navigateToURL(url);
    }}
    listsPrefixesRenderers={{
      ul: () => {
        return <View style={styles.bullet} />;
      },
    }}
  />
);

export default HTMLContainer;
