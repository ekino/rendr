import {StyleSheet} from 'react-native';

import {color} from '../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.lightGrey,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    fontSize: 14,
  },
});

export default styles;
