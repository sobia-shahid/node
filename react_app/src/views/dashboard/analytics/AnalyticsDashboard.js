import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col } from 'reactstrap';
import SalesCard from './SalesCard';
import SuberscribersGained from '../../ui-elements/cards/statistics/SubscriberGained';
import OrdersReceived from '../../ui-elements/cards/statistics/OrdersReceived';
import AvgSession from '../../ui-elements/cards/analytics/AvgSessions';
// import AvgSession from "../"
import SupportTracker from '../../ui-elements/cards/analytics/SupportTracker';
import ProductOrders from '../../ui-elements/cards/analytics/ProductOrders';
import SalesStat from '../../ui-elements/cards/analytics/Sales';
import ActivityTimeline from './ActivityTimeline';
import DispatchedOrders from './DispatchedOrders';
import '../../../assets/scss/pages/dashboard-analytics.scss';
import UserContext from '../../../360/context/user';

let $primary = '#7367F0',
  $danger = '#EA5455',
  $warning = '#FF9F43',
  $info = '#00cfe8',
  $primary_light = '#9c8cfc',
  $warning_light = '#FFC085',
  $danger_light = '#f29292',
  $info_light = '#1edec5',
  $stroke_color = '#e8e8e8',
  $label_color = '#e7eef7',
  $white = '#fff';

const AnalyticsDashboard = (props) => {
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
  return (
    <React.Fragment>
      <Row className="match-height">
        <Col lg="6" md="12">
          <SalesCard />
        </Col>
        <Col lg="3" md="6" sm="12">
          <SuberscribersGained />
        </Col>
        <Col lg="3" md="6" sm="12">
          <OrdersReceived />
        </Col>
      </Row>
      <Row className="match-height">
        <Col md="6" sm="12">
          <AvgSession labelColor={$label_color} primary={$primary} />
        </Col>
        <Col md="6" sm="12">
          <SupportTracker primary={$primary} danger={$danger} white={$white} />
        </Col>
      </Row>
      <Row className="match-height">
        <Col lg="4">
          <ProductOrders
            primary={$primary}
            warning={$warning}
            danger={$danger}
            primaryLight={$primary_light}
            warningLight={$warning_light}
            dangerLight={$danger_light}
          />
        </Col>
        <Col lg="4">
          <SalesStat strokeColor={$stroke_color} infoLight={$info_light} primary={$primary} info={$info} />
        </Col>
        <Col lg="4">
          <ActivityTimeline />
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          <DispatchedOrders />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default AnalyticsDashboard;
