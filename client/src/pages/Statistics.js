import React, { useState } from "react";
import Navbar from '../components/Navbar'
import { Button,Container,Row,Col } from "react-bootstrap";
export default function Statistics() {
    const [selectGraph,setSelectGraph]=useState("");
    function handleClick(e){
        window.location.href='/'+selectGraph;
    }
    function clickRadio(e){
        setSelectGraph(e.target.value)
    }
    return <main>
        <Navbar/>
        <section>
            <Container>
            <Row className="fs-5 my-2">
            <Col xs="12">
            <input type="radio" id="graph1" name="graph" value="graph1" onClick={clickRadio}/>
            <label htmlFor="graph1">Graph1</label></Col>
            <Col xs="12">
            <input type="radio" id="graph2" name="graph" value="graph2" onClick={clickRadio}/>
            <label htmlFor="graph2">Graph2</label></Col>
            <Col xs="12">
            <input type="radio" id="graph3" name="graph" value="graph3" onClick={clickRadio}/>
            <label htmlFor="graph3">graph3</label></Col>
            <Col xs="12">
            <input type="radio" id="graph4" name="graph" value="graph4" onClick={clickRadio}/>
            <label htmlFor="graph4">graph4</label></Col>
            <Col xs="12">
            <Button variant="primary" className="my-2" onClick={handleClick}>Show Graph</Button>
            </Col>
            </Row>
            </Container>
        </section>
    </main>
}