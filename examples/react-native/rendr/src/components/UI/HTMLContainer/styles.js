// Styles.
import { colors } from "../../../theme";

// Utils.
import { vw } from "../../../functions";

const html = {
    h1: {
        color: colors.black,
        margin: 0,
        padding: 0,
    },
    h2: {
        color: colors.black,
        margin: 0,
        padding: 0,
    },
    h3: {
        color: colors.black,
        margin: 0,
        padding: 0,
    },
    p: {
        color: colors.black,
        margin: 0,
        padding: 0,
    },
    a: {
        color: colors.black,
        textDecorationLine: "none",
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
};

export default tags = {
    h1: html.h1,
    h2: html.h2,
    h3: html.h3,
    a: html.a,
    p: html.p,
    blockquote: html.blockquote,
    img: html.img,
    i: html.i,
    em: html.em,
};
