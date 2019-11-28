import { StyleSheet } from 'react-native';

import { vw } from "../../functions";

export const spacing = {
  default: vw(20),
}

export const grid = StyleSheet.create({
  flex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollView: {
    width: "100%"
  }
});
