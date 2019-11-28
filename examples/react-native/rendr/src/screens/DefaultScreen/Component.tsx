// Core modules.
import React, {Fragment} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {TemplateProps} from '@ekino/rendr-template-react';

// Components.

// Styles.
import {grid} from '../../theme';

class Default extends React.Component<TemplateProps> {
  render() {
    const {blocks, containerRenderer} = this.props;
    return (
      <Fragment>
        <SafeAreaView style={grid.flex}>
          <ScrollView contentInsetAdjustmentBehavior='automatic'>
            <View>{containerRenderer('header', blocks)}</View>
            <View>{containerRenderer('article', blocks)}</View>
            <View>{containerRenderer('body', blocks)}</View>
            <View>{containerRenderer('footer', blocks)}</View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default Default;
