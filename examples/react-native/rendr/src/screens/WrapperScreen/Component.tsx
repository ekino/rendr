// Core modules.
import React from 'react';
import {SafeAreaView} from 'react-native';
import {Page} from '@ekino/rendr-core';
import {createPage} from '@ekino/rendr-rendering-reactnative';

// Components.
import {MainText} from '../../components';

// Styles.
import {grid} from '../../theme';

// Utilites.
import {blocks, templates} from '../../_rendr';

const ErrorScreen = text => (
  <SafeAreaView style={grid.flex}>
    <MainText>{text}</MainText>
  </SafeAreaView>
);

interface Props {
  pageContext: {
    page: Page;
  };
}

const Template = createPage(blocks, templates);

class Wrapper extends React.Component<Props> {
  render() {
    if (!(this.props.pageContext instanceof Object)) {
      return ErrorScreen(
        '"pageContext" attribute is missing or not an Object from the Props',
      );
    }

    const {pageContext} = this.props;

    if (!('page' in pageContext)) {
      return ErrorScreen('No `page` props defined in the `pageContext`');
    }

    const {
      page: {template},
    } = pageContext;

    if (templates[template]) {
      return <Template pageContext={pageContext} />;
    }

    return ErrorScreen('Template is not yet defined');
  }
}

export default Wrapper;
