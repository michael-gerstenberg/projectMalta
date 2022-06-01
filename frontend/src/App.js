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
} from 'react-bootstrap';
import RCTable from './RCTable.js';
import React, {useState, useEffect} from 'react';
import './App.scss';
import endpoints from './endpoints.json'

var _ = require('lodash');

function App() {
  const [rcs, setRCs] = useState([]);
  const defaultLang = 'en';
  const [lang, setLang] = useState(defaultLang);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState({
    field: 'rc_identifier',
    direction: 1
  });

  function requestSort(field) {
    if (sort.field == field) {
      setSort({
        field: field,
        direction: -sort['direction']
      });
    } else {
      setSort({
        field: field,
        direction: 1
      })
    }
  }

  function getAllRCs() {
    const url = endpoints['realmPrefix'] + "/getAllRCs?searchTerm=" + searchTerm + "&field=" + sort.field + "&direction=" + sort.direction;
    fetch(url).then((data) => data.json()).then((res) => setRCs(res));
  }

  useEffect(() => getAllRCs(), [searchTerm, sort]);

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
    const saveBasketUrl = endpoints['realmPrefix'] + "/addBasket";
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
      const getAllBasketNamesUrl = endpoints['realmPrefix'] + "/getAllBasketNames";
      fetch(getAllBasketNamesUrl).then((data) => data.json()).then((res) => {
        setBasketNames(res);
      });
    }
  }, [loadVisible])

  function loadBasket() {
    const getBasketUrl = endpoints['realmPrefix'] + "/getSingleBasket?arg=" + RCCollectionName;
    fetch(getBasketUrl).then(data => data.json()).then((res) => {
      setLoadedBasket(res);
      setLang(res.lang);
      setSelectedRCs(res.rc_ids);
    });
    setLoadVisible(false);
  }

  function onSearchTextChanged(event) {
    let text = event.target.value;

    let endpoint = endpoints['realmPrefix'] + "/returnrc?arg=" + text;

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
    // let endpoint = "http://185.26.156.15:5000/?id=" + RCCollectionName;
    // let embeddedBasketEndpoint = endpoints['realmPrefix'] + '/returnEmbeddedBasket'; //?name=' + loadedBasket.name + '&lang=' + loadedBasket.lang;
    let createSlidesEndpoint = endpoints['createSlides'] + '?name=' + loadedBasket.name + '&lang=' + loadedBasket.lang;
    window.open(createSlidesEndpoint, '_blank').focus();
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
            <FormControl aria-label="RC Search" onChange={(e) => setSearchTerm(e.target.value)} />
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
          <Button variant="secondary" style={{marginRight: '20px'}} disabled={exportDisabled} onClick={createSlides}>
            Export Slides
          </Button>
          <Button variant="secondary" style={{marginRight: '20px'}} onClick={() => setLoadVisible(true)}>
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
          <Button variant="secondary" style={{}} disabled={selectedRCs.length == 0} onClick={() => setSaveAsVisible(true)}>
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
          <RCTable rcs={rcs}
            selectedRCs={selectedRCs}
            toggleRC={toggleRC}
            lang={lang}
            defaultLang={defaultLang}
            sort={sort}
            requestSort={requestSort}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
