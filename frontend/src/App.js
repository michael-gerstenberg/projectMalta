import logo from './logo.svg';
import {Container, Row, Col, InputGroup, DropdownButton, Dropdown, Form, FormControl, Table} from 'react-bootstrap'
import React, {useState, useEffect} from 'react';
import './App.css';

function App() {
  const [rcs, setRCs] = useState([]);
  const defaultLang = 'en';
  const [lang, setLang] = useState(defaultLang);

  function getAllRCs() {
    const url = "https://eu-central-1.aws.data.mongodb-api.com/app/projectmalta-puclb/endpoint/getAllRCs";
    fetch(url).then((data) => data.json()).then((res) => setRCs(res));
  }

  useEffect(() => getAllRCs(), []);

  function onTextChanged(event) {
    let text = event.target.value;

    let endpoint = "https://eu-central-1.aws.data.mongodb-api.com/app/projectmalta-puclb/endpoint/returnrc?arg=" + text;

    fetch(endpoint).then((data) => data.json()).then((res) => {
      if (text == '') {
        getAllRCs();
      } else if (res.length >= 0) {
        setRCs(res);
      } else {
        setRCs([]);
      }
    });
  }

  return (
    <Container className="App" style={{"paddingTop": "15px"}}>
      <Row>
        <Col xs={3}>
          <InputGroup className="mb-3">
            <Form.Select size="lg" onChange={(e) => setLang(e.target.value)}>
              <option>en</option>
              <option>de</option>
              <option>es</option>
              <option>it</option>
            </Form.Select>
            <FormControl aria-label="RC Search" onChange={onTextChanged} />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>RC Title</th>
                <th>RC Description</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody>
              {rcs.map((rc, idx) => {
                const rcExt = rc.rc_extended[lang] ? rc.rc_extended[lang] : rc.rc_extended[defaultLang];
                return <tr key={idx}>
                  <td>{idx+1}</td>
                  <td>{rcExt.rc_title}</td>
                  <td>{rcExt.description}</td>
                  <td>
                    <ul>
                      {rc.sources.map((src) => {
                        return <a key={src.link} href={src.link}>{src.title}</a>
                      })}
                    </ul>
                  </td>
                </tr>
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
