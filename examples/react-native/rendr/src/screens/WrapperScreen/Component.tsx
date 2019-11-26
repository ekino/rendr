// Core modules.
import React, {Fragment} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {Page} from '@ekino/rendr-core';

// Styles.
import {grid} from '../../theme';

// Utilites
import {blocks, createPage, templates} from '../../_rendr';

const {templateRegistry, containerRenderer} = createPage(blocks, templates);

const ErrorScreen = text => (
  <Fragment>
    <SafeAreaView style={grid.flex}>
      <Text>{text}</Text>
    </SafeAreaView>
  </Fragment>
);

interface Props {
  page: Page;
}

class Wrapper extends React.Component<Props> {
  render() {
    if (!('page' in this.props)) {
      return ErrorScreen('No `page` props defined in the `pageContext`');
    }

    const {page} = this.props;
    const Template = templateRegistry(page.template);

    if (!Template) {
      return ErrorScreen('No Template defined.');
    }

    return (
      <Template
        page={page}
        blocks={page.blocks}
        containerRenderer={containerRenderer}
      />
    );
  }
}

export default Wrapper;
