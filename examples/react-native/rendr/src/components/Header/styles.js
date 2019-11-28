// Core modules.
import {StyleSheet} from 'react-native';
import { color } from '../../theme';

export default styles = StyleSheet.create({
  container: {
    backgroundColor: color.lightGrey,
    padding: 20,
    flexDirection: "row"
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 14,
  },
});
