import Document, { Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  constructor(props) {
    if (!props.__NEXT_DATA__.err) {
      props.__NEXT_DATA__.page = "/_pages";
    }

    super(props);
  }
}

export default MyDocument;
