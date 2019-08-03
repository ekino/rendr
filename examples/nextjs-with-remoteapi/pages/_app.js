import React from "react";
import App, { Container } from "next/app";
import PageComponent from "./_pages";

class MyApp extends App {
  // always call on server side, not on client side ...
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    // if it does not match a 404 code, return the component.
    if (
      !(
        Component.displayName === "ErrorPage" &&
        "statusCode" in pageProps &&
        pageProps.statusCode === 404
      )
    ) {
      return { pageProps };
    }

    pageProps = await PageComponent.getInitialProps(ctx);

    if (!pageProps || !("page" in pageProps)) {
      return {};
    }

    return { pageProps };
  }

  render() {
    let { Component, pageProps } = this.props;

    // once loaded in the javascript, the router will return
    // the original ErrorPage component. So for the browser,
    // we just set back the original PageComponent.
    if (!pageProps || "page" in pageProps) {
      Component = PageComponent;
    }

    return (
      <Container>
        <Component {...pageProps} />
      </Container>
    );
  }
}

export default MyApp;
