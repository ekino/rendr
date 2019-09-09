import { updateNextData } from "@ekino/rendr-rendering-nextjs";
import Document from "next/document";

export default class MyDocument extends Document {
  constructor(props) {
    // add this call, so all rendr page can be rendered
    // on the client side
    updateNextData(props);

    super(props);
  }
}