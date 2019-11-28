// Core modules.
import React, {Fragment} from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { TemplateProps } from '@ekino/rendr-template-react';

// Styles.
import { grid } from '../../theme';

const types = ['header','article','body','footer'];

class Default extends React.Component<TemplateProps> {
  render() {
    const {blocks, containerRenderer} = this.props;
    return (
      <Fragment>
        <SafeAreaView style={grid.flex}>
          <ScrollView contentInsetAdjustmentBehavior="automatic" style={grid.scrollView}>
            {types.map(type => (
              <View>{containerRenderer(type, blocks)}</View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default Default;
