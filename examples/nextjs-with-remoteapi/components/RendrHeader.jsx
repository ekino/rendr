import Link from "next/link";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";

export default function RendrHeader({ tracking, items, cities }) {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">Rendr</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/docs">Docs</Nav.Link>
          <Nav.Link href="/learn">Learn</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
