import React from 'react'
import {Navbar,Nav,Container,Button} from 'react-bootstrap'
import logout from './logout';
export default function NavbarMain() {
  const handleLogout=()=>{
    logout();
  }
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
            <Navbar.Brand href="/">
                <span className="text-capitalize">
                  Welcome {localStorage.getItem('name')}
                </span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse 
            id="navbarScroll" 
            className='text-center' 
            >
            <Nav
            className="ms-auto"
            navbarScroll
            >
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/myReviews">My Reviews</Nav.Link>
              <Nav.Link href="/about">About</Nav.Link>
            </Nav>
            <Button 
            className="text-capitalize" 
            variant="danger" 
            style={{height:'35px',
            width:'85px',
            fontSize:'15px'
            }}
            onClick={handleLogout}
            >
              Logout
            </Button>
            </Navbar.Collapse>
            </Container>
    </Navbar>
  )
}
