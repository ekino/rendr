// Core modules.
import {StyleSheet} from 'react-native';

// Styles.
import {spacing, color} from '../../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.lightGrey,
    padding: spacing.default,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.default / 2,
  },
  contents: {
    fontSize: 14,
  },
});

export default styles;
