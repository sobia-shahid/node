import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Row, Col } from 'reactstrap';
import Breadcrumbs from '../../components/@vuexy/breadCrumbs/BreadCrumb';
import * as yup from 'yup';
import { Formik, Field, ErrorMessage } from 'formik';
import { Button } from 'reactstrap';
import swal from 'sweetalert';
import TextField from '@material-ui/core/TextField';

import CustomField from './TextField';
import { UserContext } from '../../360/context/user';

const subscriptionSchema = yup.object({
  cardNo: yup
    .string()
    .matches(
      // Credit card regex validations.
      '^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35d{3})d{11})$',
      'You entered invalid card no.'
    )
    .required('Card Number is required.'),
  cvv: yup.string().matches('^[0-9]{3,4}$', 'CVV do not match to specified format.').required('CVV is required.'),
  expmonth: yup
    .string()
    .matches('^(0[1-9]|1[0-2])$', 'Invalid expiration mongth format.')
    .required('Expiration Month is required.'),
  expyear: yup
    .string()
    .matches('^([0-9]{4}|[0-9]{2})$', 'Invalid expiration year format.')
    .required('Expiration Year is required.')
  // expirationDate: yup.date().required()
});

const PaymentForm = (props) => {
  const { subscribed } = useContext(UserContext);
  const [ user, setUser ] = useState(useContext(UserContext).user);
  const isSubscribed = user.user.subscriptionId ? true : false;
  const [ disable, setDisable ] = useState(false);

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

  const formSubmitted = (values) => {
    // demo card
    // 4242424242424242
    setDisable(true);
    const card = {
      cvc: values.cvv,
      cardNo: values.cardNo,
      expirationMonth: values.expmonth,
      expirationYear: values.expyear,
      email: user.user.email
    };
    console.log(card);

    axios
      .post('/api/gateway/subscribe', card)
      .then((res) => {
        // setting the subscriptionId for user in localStorage
        setUser(subscribed(res.data.subscriptionId, res.data.customerId));

        swal('Good job!', 'Subscription is successfull!', 'success', {
          button: 'OK',
          timer: 6000
        });
      })
      .catch((err) => {
        console.log(err.response.data);
        swal('Error!', err.response.data.message ? err.response.data.message : 'Something is gone wrong.', 'error', {
          button: 'OK!',
          timer: 6000
        });
      })
      .finally(() => {
        setDisable(false);
      });
  };

  const unsubscribeNow = () => {
    setDisable(true);
    axios
      .post(`/api/gateway/unsubscribe/${user.user.subscriptionId}`)
      .then((res) => {
        setUser(subscribed('', ''));

        // subscribed(false);
        swal('Good job!', 'Unsubscribe is successfull!', 'success', {
          button: 'OK',
          timer: 6000
        });
        console.log(user);
      })
      .catch((err) => {
        console.log(err);
        swal('Error!', err.response.data.message, 'error', {
          button: 'OK!',
          timer: 6000
        });
      })
      .finally(() => {
        setDisable(false);
      });
    console.log(user);
  };

  return (
    <React.Fragment>
      <Breadcrumbs breadCrumbTitle="Subscribe" breadCrumbParent="Dashboard" breadCrumbActive="Subscribe" />
      {isSubscribed ? (
        <div>
          <h1>You have already subscribed.</h1>
          <Button.Ripple color="primary" className="mr-1 mb-1" size="lg" onClick={unsubscribeNow} close={disable}>
            UNSUBSCRIBE NOW
          </Button.Ripple>
        </div>
      ) : (
        <Row>
          <Col sm="12">
            <StyledForm>
              <div className="row">
                <div className="col-75">
                  <div className="container">
                    <Formik
                      initialValues={{
                        cardNo: '',
                        cvv: '',
                        expmonth: '',
                        expyear: '',
                        phoneNumber: ''
                      }}
                      validationSchema={subscriptionSchema}
                      onSubmit={(values, actions) => {
                        console.log('clicked');
                        formSubmitted(values);
                      }}
                    >
                      {({ values, errors, touched, handleSubmit, handleChange, handleBlur }) => (
                        <div className="row">
                          <div className="col-50">
                            <h3>Payment</h3>
                            <label for="fname">Accepted Cards</label>
                            <div className="icon-container">
                              <i className="fa fa-cc-visa" style={{ color: 'navy' }} />
                              <i className="fa fa-cc-amex" style={{ color: 'blue' }} />
                              <i className="fa fa-cc-mastercard" style={{ color: 'red' }} />
                              <i className="fa fa-cc-discover" style={{ color: 'orange' }} />
                            </div>
                            <label for="cardNo">Credit card number</label>
                            <Field
                              className="input"
                              type="text"
                              id="cardNo"
                              name="cardNo"
                              placeholder="1111222233334444"
                              value={values.cardNo}
                              onChange={handleChange('cardNo')}
                              onBlur={handleBlur('cardNo')}
                            />
                            <div className="error">
                              <ErrorMessage name="cardNo" />
                            </div>
                            <label for="expmonth">Exp Month</label>
                            <Field
                              className="input"
                              type="text"
                              id="expmonth"
                              name="expmonth"
                              placeholder="01"
                              value={values.expmonth}
                              onChange={handleChange('expmonth')}
                              onBlur={handleBlur('expmonth')}
                              as="select"
                            >
                              <option value="-1">Select Month</option>
                              <option value="01">JAN</option>
                              <option value="02">FEB</option>
                              <option value="03">MAR</option>
                              <option value="04">APR</option>
                              <option value="05">MAY</option>
                              <option value="06">JUN</option>
                              <option value="07">JUL</option>
                              <option value="08">AUG</option>
                              <option value="09">SEP</option>
                              <option value="10">OCT</option>
                              <option value="11">NOV</option>
                              <option value="12">DEC</option>
                            </Field>
                            <div className="error">
                              <ErrorMessage name="expmonth" />
                            </div>

                            <div className="row">
                              <div className="col-50">
                                <label for="expyear">Exp Year</label>
                                <Field
                                  className="input"
                                  type="text"
                                  id="expyear"
                                  name="expyear"
                                  placeholder="2018"
                                  value={values.expyear}
                                  onChange={handleChange('expyear')}
                                  onBlur={handleBlur('expyear')}
                                />
                                <div className="error">
                                  <ErrorMessage name="expyear" />
                                </div>
                              </div>
                              <div className="col-50">
                                <label for="cvv">CVV</label>
                                <Field
                                  className="input"
                                  type="text"
                                  id="cvv"
                                  name="cvv"
                                  placeholder="352"
                                  value={values.cvv}
                                  onChange={handleChange('cvv')}
                                  onBlur={handleBlur('cvv')}
                                />
                                <div className="error">
                                  <ErrorMessage name="cvv" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <button type="submit" class="btn" onClick={handleSubmit} disabled={disable}>
                            Continue to checkout
                          </button>
                        </div>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            </StyledForm>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};

export default PaymentForm;

const StyledForm = styled.div`
  .row {
    display: -ms-flexbox; /* IE10 */
    display: flex;
    -ms-flex-wrap: wrap; /* IE10 */
    flex-wrap: wrap;
    margin: 0 -16px;
  }

  .col-25 {
    -ms-flex: 25%; /* IE10 */
    flex: 25%;
  }

  .col-50 {
    -ms-flex: 50%; /* IE10 */
    flex: 50%;
  }

  .col-75 {
    -ms-flex: 75%; /* IE10 */
    flex: 75%;
  }

  .col-25,
  .col-50,
  .col-75 {
    padding: 0 16px;
  }

  .container {
    background-color: #f2f2f2;
    padding: 5px 20px 15px 20px;
    border: 1px solid lightgrey;
    border-radius: 3px;
  }

  .input {
    width: 100%;
    margin-bottom: 20px;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  label {
    margin-bottom: 10px;
    display: block;
  }

  .icon-container {
    margin-bottom: 20px;
    padding: 7px 0;
    font-size: 24px;
  }

  .btn {
    background-color: #4caf50;
    color: white;
    padding: 12px;
    margin: 10px 0;
    border: none;
    width: 100%;
    border-radius: 3px;
    cursor: pointer;
    font-size: 17px;
  }
  .error {
    color: red;
  }

  .btn:hover {
    background-color: #45a049;
  }

  span.price {
    float: right;
    color: grey;
  }

  /* Responsive layout - when the screen is less than 800px wide, make the two columns stack on top of each other instead of next to each other (and change the direction - make the "cart" column go on top) */
  @media (max-width: 800px) {
    .row {
      flex-direction: column-reverse;
    }
    .col-25 {
      margin-bottom: 20px;
    }
  }
`;
// 4111111111111111
