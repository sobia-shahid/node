import React, { useContext, useEffect, useState } from 'react';
import { Row } from 'reactstrap';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Breadcrumbs from '../../components/@vuexy/breadCrumbs/BreadCrumb';
import GoToIcon from '@material-ui/icons/ExitToApp';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import axios from 'axios';
// import Date from 'datejs';

import { UserContext } from '../../360/context/user';
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    minWidth: 700
  }
});

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function total(items) {
  return items.map(({ amount }) => amount).reduce((sum, i) => sum + i, 0);
}

function SpanningTable({ rows }) {
  const classes = useStyles();

  return (
    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
      <Table className={classes.table} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={3}>
              Details
            </TableCell>
            <TableCell align="right">Price</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Created At</TableCell>
            <TableCell align="right">Currency</TableCell>
            <TableCell align="right">Reason</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.createdAt}>
              <TableCell>{row.createdAt}</TableCell>
              <TableCell align="left">{row.currency}</TableCell>
              <TableCell align="left">{row.reason}</TableCell>
              <TableCell align="left">{ccyFormat(row.amount)}</TableCell>
              <TableCell>
                <a href={row.hostedUrl} target="_blank">
                  <IconButton aria-label="goToLink" className={classes.margin} size="small">
                    <GoToIcon fontSize="inherit" />
                  </IconButton>
                </a>
              </TableCell>
              <TableCell>
                <a href={row.downloadUrl} target="_blank">
                  <IconButton aria-label="download" className={classes.margin} size="small">
                    <DownloadIcon fontSize="inherit" />
                  </IconButton>
                </a>
              </TableCell>
            </TableRow>
          ))}

          <TableRow>
            <TableCell colSpan={2} />
            <TableCell>
              <b>Total</b>
            </TableCell>
            <TableCell>{ccyFormat(total(rows))}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function History() {
  const [ user, setUser ] = useState(useContext(UserContext).user);
  const [ invoices, setInvoices ] = useState([]);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    axios
      .put(`/api/gateway/sub/${user.user.subscriptionId}/status`, { email: user.user.email })
      .then((res) => {
        if (!res.data.status) {
          // it will remove the subscriptionId and customerId from localstorage
          user.user.isPremium = false;
          user.user.subscriptionId = '';
          user.user.customerId = '';

          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .catch((err) => {
        user.user.isPremium = false;
        user.user.subscriptionId = '';
        user.user.customerId = '';

        localStorage.setItem('user', JSON.stringify(user));
      });
  }, []);

  useEffect(() => {
    if (user.user.customerId)
      axios
        .get(`/api/gateway/reciepts/${user.user.customerId}`)
        .then((res) => {
          setInvoices(res.data);
        })
        .catch((err) => {
          console.log(err);
          console.log(err.response);
        });
  }, []);
  function createRow(createdAt, currency, reason, amount, hostedUrl, downloadUrl) {
    return { createdAt, currency, reason, amount, hostedUrl, downloadUrl };
  }

  const rows = invoices.map((invoice) => {
    return createRow(
      new Date(invoice.createdAt * 1000).toDateString(),
      invoice.currency,
      invoice.reason,
      invoice.amount / 100,
      invoice.hostedUrl,
      invoice.downloadUrl
    );
  });

  return (
    <React.Fragment>
      <Breadcrumbs breadCrumbTitle="History" breadCrumbParent="Dashboard" breadCrumbActive="History" />
      {rows.length ? <SpanningTable rows={rows} /> : <p>You don't have any payment history.</p>}
    </React.Fragment>
  );
}
