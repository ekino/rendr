// Core modules.
import { StyleSheet } from 'react-native';

// Styles.
import { spacing, color } from '../../../theme';

export default styles = StyleSheet.create({
    container: {
        backgroundColor: color.lightGrey,
        padding: spacing.default,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: spacing.default / 2
    },
    contents: {
        fontSize: 14,
    }
});
