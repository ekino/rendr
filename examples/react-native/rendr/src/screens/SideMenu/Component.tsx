// Core modules.
import React from 'react';
import {SafeAreaView, ScrollView} from 'react-native';
import {Page} from '@ekino/rendr-core';

// Components.
import {Menu} from '../../components';

// Styles.
import {grid} from '../../theme';
import styles from './styles';

interface Props {
  pageContext: {
    page: Page;
  };
}

class SideMenu extends React.Component<Props> {
  render() {
    const {
      pageContext: {
        page: {path},
      },
    } = this.props;

    return (
      <>
        <SafeAreaView style={[grid.flex, styles.safeAreaView]}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={[grid.scrollView, styles.scrollView]}>
            <Menu current={path} />
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

export default SideMenu;
