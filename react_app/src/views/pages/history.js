import React from 'react';
import { Row, Col } from 'reactstrap';
import Breadcrumbs from '../../components/@vuexy/breadCrumbs/BreadCrumb';
import axios from 'axios';
import { Button } from 'reactstrap';
import fileDownload from 'js-file-download';

export default function history() {
  const handleDownload = () => {
    axios
      .get('http://localhost:5000/api/gateway/invoice/6045f1b9a1247b785c64f773', { responseType: 'blob' })
      .then((res) => {
        fileDownload(res.data, 'reciept.pdf');
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response);
      });
  };
  return (
    <React.Fragment>
      <Breadcrumbs breadCrumbTitle="History" breadCrumbParent="Dashboard" breadCrumbActive="History" />
      <Row>
        <Col sm="12">
          <h1>Payment History</h1>
          <Button.Ripple color="primary" className="mr-1 mb-1" size="lg" onClick={handleDownload}>
            DOWNLOAD NOW
          </Button.Ripple>
          <a href="http://localhost:5000/api/gateway/invoice/6045f1b9a1247b785c64f773" target="_blank">
            Download
          </a>
        </Col>
      </Row>
    </React.Fragment>
  );
}
