// Core modules.
import React, {Fragment} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';
import {Page} from '@ekino/rendr-core';

import {Menu} from '../../components';

// Styles.
import {grid} from '../../theme';
import styles from './styles';

interface Props {
  page: Page
}

class SideMenu extends React.Component<Props> {
  render() {
    const { 
      page: {
        path
      }
    } = this.props;

    return (
      <Fragment>
        <SafeAreaView style={[grid.flex, styles.safeAreaView]}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={[grid.scrollView, styles.scrollView]}
          >
            <Menu current={path} />
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default SideMenu;
