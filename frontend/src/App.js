import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Siswa from "./components/Siswa";
import "bootstrap/dist/css/bootstrap.min.css";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

// Konfigurasi toastr
toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  positionClass: "toast-top-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">
              Data Siswa
            </Navbar.Brand>
            {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">
                  Siswa
                </Nav.Link>
              </Nav>
            </Navbar.Collapse> */}
          </Container>
        </Navbar>

        <Container className="my-4">
          <Routes>
            <Route path="/" element={<Siswa />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
