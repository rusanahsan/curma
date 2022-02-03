import React from "react";
import { Link } from "react-router-dom";
import {Button,Container} from "react-bootstrap";
export default function Error() {
  return (
    <section>
        <h1 className="text-center my-5">oops! it's a dead end</h1>
        <Container fluid className="text-center">
          <Link to="/"><Button variant="dark">Back Home</Button></Link>
        </Container>
    </section>
  );
}
