import logo from './logo.svg';
import {
  Button,
  Container,
  Row,
  Col,
  InputGroup,
  DropdownButton,
  Dropdown,
  Form,
  FormControl,
  Modal,
  Table
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons'
import React, {useState, useEffect} from 'react';
import './App.css';

var _ = require('lodash');

function App() {
  const mongoBG = "#4DB33D";
  const [rcs, setRCs] = useState([]);
  const defaultLang = 'en';
  const [lang, setLang] = useState(defaultLang);

  function getAllRCs() {
    const url = "https://eu-central-1.aws.data.mongodb-api.com/app/projectmalta-puclb/endpoint/getAllRCs";
    fetch(url).then((data) => data.json()).then((res) => setRCs(res));
  }

  useEffect(() => getAllRCs(), []);

  const [selectedRCs, setSelectedRCs] = useState([]);
  function toggleRC(id) {
    let localRCs = structuredClone(selectedRCs);
    if (localRCs.includes(id)) {
      localRCs.splice(localRCs.indexOf(id), 1);
    } else {
      localRCs.push(id);
    }
    setSelectedRCs(localRCs);
  }

  const [saveAsVisible, setSaveAsVisible] = useState(false);
  const [RCCollectionName, setRCCollectionName] = useState("");

  function saveBasket() {
    const saveBasketUrl = "https://eu-central-1.aws.data.mongodb-api.com/app/projectmalta-puclb/endpoint/addBasket";
    let basket = {
      "name": RCCollectionName,
      "lang": lang,
      "rc_ids": selectedRCs
    };
    fetch(saveBasketUrl, {
      method: 'POST',
      body: JSON.stringify(basket)
    }).then((r) => console.log(r));
    setLoadedBasket(basket);
    setSaveAsVisible(false);
  }

  const [loadVisible, setLoadVisible] = useState(false);
  const [basketNames, setBasketNames] = useState([]);
  const [loadedBasket, setLoadedBasket] = useState({});
  useEffect(() => {
    if (loadVisible) {
      const getAllBasketNamesUrl = "https://eu-central-1.aws.data.mongodb-api.com/app/projectmalta-puclb/endpoint/getAllBasketNames";
      fetch(getAllBasketNamesUrl).then((data) => data.json()).then((res) => {
        setBasketNames(res);
      });
    }
  }, [loadVisible])

  function loadBasket() {
    const getBasketUrl = "https://eu-central-1.aws.data.mongodb-api.com/app/projectmalta-puclb/endpoint/getSingleBasket?arg=" + RCCollectionName;
    fetch(getBasketUrl).then(data => data.json()).then((res) => {
      setLoadedBasket(res);
      setLang(res.lang);
      setSelectedRCs(res.rc_ids);
    });
    setLoadVisible(false);
  }

  function onSearchTextChanged(event) {
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

  function createSlides() {
    let endpoint = "http://185.26.156.15:5000/?id=" + RCCollectionName;
    fetch(endpoint).then((data) => data.json()).then(res => {
      console.log(res);
    });
  }

  // console.log(loadedBasket.rc_ids.sort().join(',') == selectedRCs.sort().join(','));
  let exportDisabled = lang != loadedBasket.lang || loadedBasket.rc_ids.sort().join(',') != selectedRCs.sort().join(',');

  return (
    <Container className="App" style={{"paddingTop": "15px"}}>
      <Row>
        <Col xs={3}>
          <InputGroup className="mb-3">
            <Form.Select size="lg" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option>en</option>
              <option>de</option>
              <option>es</option>
              <option>it</option>
            </Form.Select>
            <FormControl aria-label="RC Search" onChange={onSearchTextChanged} />
          </InputGroup>
        </Col>
        <Col xs={2} style={{textAlign: 'left'}}>
          <Button variant="secondary" disabled={!exportDisabled || Object.keys(loadedBasket).length == 0} onClick={loadBasket}>
            Reset Selection
          </Button>
        </Col>
        <Col style={{textAlign: 'right'}}>
          {exportDisabled ?
            <label style={{marginRight: '10px', color: 'red'}}>Save your collection first!</label> : null
          }
          <Button variant="warning" style={{marginRight: '20px'}} disabled={exportDisabled} onClick={createSlides}>
            Export Slides
          </Button>
          <Button variant="secondary" onClick={() => setLoadVisible(true)}>
            Load
          </Button>
          <Modal show={loadVisible} onHide={() => setLoadVisible(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Load RC Collection</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FormControl type="text" list="RCCollectionSelect" onChange={(e) => setRCCollectionName(e.target.value)} />
              <datalist id="RCCollectionSelect">
                {basketNames.map((basketName) => {
                  return <option key={basketName.name}>{basketName.name}</option>;
                })}
              </datalist>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setLoadVisible(false)}>
                Close
              </Button>
              <Button disabled={RCCollectionName.length == 0} onClick={loadBasket}>
                Load
              </Button>
            </Modal.Footer>
          </Modal>
          <Button style={{backgroundColor:mongoBG}} disabled={selectedRCs.length == 0} onClick={() => setSaveAsVisible(true)}>
            Save As
          </Button>
          <Modal show={saveAsVisible} onHide={() => setSaveAsVisible(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Save RCs</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Enter a Name for your RC Collection</p>
              <FormControl value={RCCollectionName} onChange={(e) => setRCCollectionName(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSaveAsVisible(false)}>
                Close
              </Button>
              <Button disabled={RCCollectionName.length == 0} onClick={saveBasket}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>RC Title</th>
                <th>RC Definition</th>
                <th>RC Description</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody style={{textAlign: 'left'}}>
              {rcs.map((rc, idx) => {
                const rcExt = rc.rc_extended[lang] ? rc.rc_extended[lang] : rc.rc_extended[defaultLang];
                const isSelected = selectedRCs.includes(rc._id['$oid']);
                return <tr key={idx} style={{backgroundColor: isSelected ? mongoBG: "#00000000"}}>
                  <td style={{cursor: "pointer", textAlign: "center", width: "40px"}} onClick={()=>toggleRC(rc._id['$oid'])}>
                  {isSelected ?
                    <FontAwesomeIcon icon={faCheckSquare} size="lg" /> : <FontAwesomeIcon icon={faSquare} size="lg" />
                  }
                  </td>
                  <td>{rc.rc_identifier}</td>
                  <td>{rcExt.rc_title}</td>
                  <td>{rcExt.description}</td>
                  <td>
                    <ul>
                      {rc.sources.map((src) => {
                        return <li><a href={src.link}>{src.title}</a></li>
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
