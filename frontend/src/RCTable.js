import {
  Modal,
  Table
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faSquare, faCopy, faEdit } from '@fortawesome/free-regular-svg-icons';
import {useState} from 'react';

function checkIcon(icon, rc, props) {
  return <FontAwesomeIcon icon={icon} size="lg" style={{cursor: 'pointer'}} onClick={() => props.toggleRC(rc._id['$oid'])} />
}

function CopyIcon(props) {
  return <FontAwesomeIcon icon={faCopy} size="lg" style={{cursor: 'pointer', marginTop: '10px'}} onClick={() => props.toggleCopyRCDialog(props.rc)} />
}

function CopyRCtd(props) {
  return <td style={{cursor: 'pointer'}} onClick={() => {
    navigator.clipboard.writeText(props.copyText);
    props.closeModal();
  }}>
    {props.children}
  </td>
}

function RCTable(props) {
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copyRC, setCopyRC] = useState(null);
  function toggleCopyRCDialog(rc) {
    setCopyModalVisible(!copyModalVisible);
    if (!copyModalVisible) {
      setCopyRC(rc)
    } else {
      setCopyRC(null);
    }
  }

  return (
    <>
      {copyModalVisible ? <Modal size="xl" show={copyModalVisible} onHide={()=>setCopyModalVisible(false)}>
        <Modal.Header closeButton>
          <p>Select Field to Copy</p>
        </Modal.Header>
        <Modal.Body>
          <Table bordered>
            <thead>
              <tr>
                <th>RC Title</th>
                <th>RC Definition</th>
                <th>RC Description</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <CopyRCtd closeModal={() => setCopyModalVisible(false)} copyText={copyRC.rc_identifier}>{copyRC.rc_identifier}</CopyRCtd>
                <CopyRCtd closeModal={() => setCopyModalVisible(false)} copyText={copyRC.rc_title}>{copyRC.rc_title}</CopyRCtd>
                <CopyRCtd closeModal={() => setCopyModalVisible(false)} copyText={copyRC.description}>{copyRC.description}</CopyRCtd>
                <td onClick={() => {
                  setCopyModalVisible(false);
                  eval(`
                  let type = 'text/html';
                  let blob = new Blob([copyRC.sources.map((src) => {
                    return "<a href='" + src.link + "'>" + src.title + "</a>";
                  }).join(', ')], { type });
                  let data = [new ClipboardItem({ [type]: blob })];
                  navigator.clipboard.write(data);
                  `);
                }} style={{cursor: 'pointer'}}>
                  <ul>
                    {copyRC.sources.map((src) => {
                      return <li>{src.title}</li>
                    })}
                  </ul>
                </td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
      </Modal> : null
      }
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
          {props.rcs.map((rc, idx) => {
            const rcExt = rc.rc_extended[props.lang] ? rc.rc_extended[props.lang] : rc.rc_extended[props.defaultLang];
            const isSelected = props.selectedRCs.includes(rc._id['$oid']);
            return <tr key={idx} className={isSelected ? "selected" : ""}>
              <td style={{textAlign: "center", width: "40px"}}>
                {isSelected ?
                  checkIcon(faCheckSquare, rc, props) : checkIcon(faSquare, rc, props)
                }
                <CopyIcon rc={{
                  'rc_identifier': rc.rc_identifier,
                  'rc_title': rcExt.rc_title,
                  'description': rcExt.description,
                  'sources': rc.sources
                }} toggleCopyRCDialog={toggleCopyRCDialog}/>
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
    </>
  );
}

export default RCTable;
