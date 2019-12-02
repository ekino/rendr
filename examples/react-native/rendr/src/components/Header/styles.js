// Core modules.
import {StyleSheet} from 'react-native';

// Styles.
import {color, spacing} from '../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.lightGrey,
    padding: spacing.default,
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
