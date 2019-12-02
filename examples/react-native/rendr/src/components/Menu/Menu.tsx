// Core modules.
import React from 'react';
import {View} from 'react-native';

// Components.
import {MenuLink} from '../index';

// Navigation.
import {onClick} from '../../navigation';

// Styles.
import styles from './styles';

interface Props {
  current?: string;
}

const items = [
  {
    title: 'Home',
    url: '/',
  },
  {
    title: 'About',
    url: '/about',
  },
  {
    title: '😎 ekino.co.uk',
    url: 'https://www.ekino.co.uk',
    external: true,
  },
];

const Menu = ({current}: Props) => (
  <View style={styles.container}>
    {items.map(item => (
      <MenuLink
        key={item.url}
        title={item.title}
        active={current === item.url}
        onPress={() =>
          onClick[item.external ? 'navigateToURL' : 'navigateToScreen'](
            item.url,
          )
        }
      />
    ))}
  </View>
);

export default Menu;
