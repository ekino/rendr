// Core modules.
import {StyleSheet} from 'react-native';

// Styles.
import {color, spacing} from '../../../theme';

const styles = StyleSheet.create({
  item: {
    color: color.white,
    padding: spacing.default,
  },
  active: {
    backgroundColor: color.accent,
  },
});

export default styles;
