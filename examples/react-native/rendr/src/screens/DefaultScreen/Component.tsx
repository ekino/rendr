// Core modules.
import React from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {TemplateProps} from '@ekino/rendr-template-react';

// Styles.
import {grid} from '../../theme';

const types = ['header', 'article', 'body', 'footer'];

class Default extends React.Component<TemplateProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {blocks, containerRenderer} = this.props;
    console.log('blocks', blocks);
    console.log('containerRenderer', containerRenderer);
    return (
      <>
        <SafeAreaView style={grid.flex}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={grid.scrollView}>
            {types.map(type => (
              <View key={type}>{containerRenderer(type, blocks)}</View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

export default Default;
