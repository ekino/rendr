// Core modules.
import {StyleSheet} from 'react-native';

// Functions.
import {vw} from '../../../functions';

// Styles.
import {color} from '../../../theme';

const styles = StyleSheet.create({
  bun: {
    width: vw(26),
    height: vw(16),
  },
  patty: {
    backgroundColor: color.white,
    height: vw(2),
    marginBottom: vw(5),
    width: '100%',
  },
});

export default styles;
