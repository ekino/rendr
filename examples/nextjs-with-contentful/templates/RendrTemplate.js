import css from "./RendrTemplate.scss";

import { Container } from "react-bootstrap";

{
  /* <Container>
  <Row>
    <Col>1 of 2</Col>
    <Col>2 of 2</Col>
  </Row>
  <Row>
    <Col>1 of 3</Col>
    <Col>2 of 3</Col>
    <Col>3 of 3</Col>
  </Row>
</Container>; */
}

export default function RendrTemplate({ containerRenderer, page, blocks }) {
  return (
    <Container>
      <header role="banner">{containerRenderer("header", blocks)}</header>
      <main>{containerRenderer("body", blocks)}</main>
      <footer role="contentinfo">{containerRenderer("footer", blocks)}</footer>
    </Container>
  );
}
