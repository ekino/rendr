// Styles.
import {color, spacing} from '../../../theme';

// Functions.
import {vw} from '../../../functions';

export const styles = {
  h1: {
    color: color.black,
    margin: 0,
    padding: 0,
  },
  h2: {
    color: color.black,
    margin: 0,
    padding: 0,
  },
  h3: {
    color: color.black,
    margin: 0,
    padding: 0,
  },
  p: {
    color: color.black,
    margin: 0,
    padding: 0,
  },
  a: {
    color: color.black,
    textDecorationLine: 'none',
  },
  i: {
    margin: 0,
    padding: 0,
  },
  blockquote: {
    margin: 0,
    padding: 0,
  },
  em: {
    margin: 0,
    padding: 0,
  },
  img: {
    margin: 0,
    padding: 0,
    width: vw(375),
  },
  ul: {
    paddingLeft: 0,
    marginBottom: spacing.default,
  },
  li: {
    margin: 0,
    padding: 0,
  },
  bullet: {
    marginRight: vw(10),
    width: vw(8),
    height: vw(8),
    marginTop: vw(4),
    borderRadius: vw(8),
    backgroundColor: color.primary,
  }
};

const tags = {
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
  a: styles.a,
  p: styles.p,
  blockquote: styles.blockquote,
  img: styles.img,
  i: styles.i,
  em: styles.em,
  ul: styles.ul,
  li: styles.li,
};

export default tags;
