import React, { useContext, useState } from 'react';
import { Row, Col } from 'reactstrap';
import Breadcrumbs from '../../components/@vuexy/breadCrumbs/BreadCrumb';
import axios from 'axios';
import { Button } from 'reactstrap';
import fileDownload from 'js-file-download';

import { UserContext } from '../../360/context/user';

export default function History() {
  const [ user, setUser ] = useState(useContext(UserContext).user);
  const [ link, setLink ] = useState(`http://localhost:5000/api/gateway/invoice/${user.user._id}`);
  console.log(user.user._id);
  console.log(link);

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
          <a
            // href="http://localhost:5000/api/gateway/invoice/6045f1b9a1247b785c64f773"
            href={link}
            target="_blank"
          >
            <Button.Ripple color="primary" className="mr-1 mb-1" size="lg">
              DOWNLOAD NOW
            </Button.Ripple>
          </a>
        </Col>
      </Row>
    </React.Fragment>
  );
}
