// Core modules.
import React from 'react';
import { View } from 'react-native';
import { Page } from '@ekino/rendr-core';

import { Burger } from '../../components';

// Styles.
import styles from './styles';

interface Props {
  page: Page
}

class SideMenu extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Burger />
      </View>
    );
  }
}

export default SideMenu;
