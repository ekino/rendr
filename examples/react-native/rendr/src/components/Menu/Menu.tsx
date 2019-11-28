// Core modules.
import React from 'react';
import { View } from 'react-native';

// Components.
import { MenuLink } from '../index';

// Navigation.
import { onClick } from '../../navigation';

// Styles.
import styles from './styles';

interface Props {
  current?: string;
}

const items = [
  {
    title: 'Home',
    url: '/'
  },
  {
    title: 'About',
    url: '/about'
  },
  {
    title: 'Ekino.co.uk',
    url: 'https://www.ekino.co.uk',
    external: true
  },
];

export default class Menu extends React.Component<Props> {
  render() {
    const { current } = this.props;
    return (
      <View style={styles.container}>
        {items.map(item => (
          <MenuLink
            key={item.url}
            title={item.title}
            active={current === item.url}
            onPress={() => onClick[item.external ? 'navigateToURL' : 'navigateToScreen'](item.url)}
          />
        ))}
      </View>
    );
  }
}
