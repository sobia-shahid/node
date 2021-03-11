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
  firstName: yup.string().required('First Name is Required.'),
  lastName: yup.string().required('Last Name is Required.'),
  email: yup.string().email('Provide email by which you logged in.').required(),
  address1: yup.string().required(),
  address2: yup.string().required(),
  country: yup.string().required(),
  city: yup.string().required(),
  state: yup.string().required(),
  zip: yup.string().required(),
  phoneNumber: yup.string().required(),
  cardName: yup.string().required(),
  cardNo: yup
    .string()
    .matches(
      // Credit card regex validations.
      '^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35d{3})d{11})$'
    )
    .required(),
  cvv: yup.string().matches('^[0-9]{3,4}$').required(),
  expmonth: yup.string().matches('^(0[1-9]|1[0-2])$').required(),
  expyear: yup.string().matches('^([0-9]{4}|[0-9]{2})$').required(),
  expirationDate: yup.date()
});

const getCardType = (cardNumber) => {
  // visa
  var re = new RegExp('^4');
  if (cardNumber.match(re) != null) return 'Visa';

  // Mastercard
  // Updated for Mastercard 2017 BINs expansion
  if (
    /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(
      cardNumber
    )
  )
    return 'Mastercard';

  // AMEX
  re = new RegExp('^3[47]');
  if (cardNumber.match(re) != null) return 'AMEX';

  // Discover
  re = new RegExp('^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)');
  if (cardNumber.match(re) != null) return 'Discover';

  // Diners
  re = new RegExp('^36');
  if (cardNumber.match(re) != null) return 'Diners';

  // Diners - Carte Blanche
  re = new RegExp('^30[0-5]');
  if (cardNumber.match(re) != null) return 'Diners - Carte Blanche';

  // JCB
  re = new RegExp('^35(2[89]|[3-8][0-9])');
  if (cardNumber.match(re) != null) return 'JCB';

  // Visa Electron
  re = new RegExp('^(4026|417500|4508|4844|491(3|7))');
  if (cardNumber.match(re) != null) return 'Visa Electron';

  return '';
};

const PaymentForm = (props) => {
  const { subscribed } = useContext(UserContext);
  const [ user, setUser ] = useState(useContext(UserContext).user);
  const { isSubscribed } = user.user;
  const [ disable, setDisable ] = useState(false);

  useEffect(() => {
    window.TCO.loadPubKey('demo');
  }, []);

  const formSubmitted = (values) => {
    setDisable(true);

    // console.log(data.response.token.token);

    const user = {
      FirstName: values.firstName,
      LastName: 'Customer',
      Email: values.email,
      Address1: values.address1,
      Address2: values.address2,
      City: values.city,
      State: values.state,
      Zip: values.zip,
      CountryCode: values.country,
      Phone: values.phoneNumber,
      Fax: '', //
      Language: 'en', //
      Company: '' //
    };
    const card = {
      CCID: values.cvv,
      CardNumber: values.cardNo,
      CardType: getCardType(values.cardNo),
      ExpirationMonth: values.expmonth,
      ExpirationYear: values.expyear,
      HolderName: values.cardName
    };
    const obj = {
      user: user,
      card: card,
      ExpirationDate: values.expirationDate
    };
    console.log(obj);

    axios
      .post('/api/gateway/payment', obj)
      .then((res) => {
        setUser(subscribed(true));

        console.log(subscribed(true));

        swal('Good job!', 'Subscription is successfull!', 'success', {
          button: 'OK',
          timer: 6000
        });
      })
      .catch((err) => {
        console.log(err);
        swal('Error!', 'There is Error, Please try again! Check your email...', 'error', {
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
      .post('/api/gateway/unsub', { email: user.user.email })
      .then((res) => {
        setUser(subscribed(false));

        // subscribed(false);
        swal('Good job!', 'Unsubscribe is successfull!', 'success', {
          button: 'OK',
          timer: 6000
        });
        console.log(user);
      })
      .catch((err) => {
        console.log(err);
        swal('Error!', 'There is Error, Please try again! Check your email...', 'error', {
          button: 'OK!',
          timer: 6000
        });
      })
      .finally(() => {
        setDisable(false);
      });
  };

  return (
    //   <p>Payment module here</p>
    <React.Fragment>
      <Breadcrumbs breadCrumbTitle="Subscribe" breadCrumbParent="Dashboard" breadCrumbActive="Subscribe" />
      {isSubscribed ? (
        <div>
          <h1>You have already subscribed.</h1>
          <Button.Ripple color="primary" className="mr-1 mb-1" size="lg" onClick={unsubscribeNow} disabled={disable}>
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
                        firstName: '',
                        email: '',
                        address1: '',
                        address2: '',
                        country: '',
                        city: '',
                        state: '',
                        zip: '',
                        cardName: '',
                        cardNo: '',
                        cvv: '',
                        expmonth: '',
                        expyear: '',
                        phoneNumber: '',
                        expirationDate: ''
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
                            <h3>Billing Address</h3>
                            <CustomField
                              name={'firstName'}
                              label={'First Name'}
                              labelClass={'fa fa-user'}
                              value={values.firstName}
                              placeholder="John"
                              type="text"
                              className="input"
                              id="firstName"
                              name="firstName"
                              changed={handleChange('firstName')}
                              blured={handleBlur('firstName')}
                            />
                            <CustomField
                              name={'lastName'}
                              label={'Last Name'}
                              labelClass={'fa fa-user'}
                              value={values.lastName}
                              placeholder="Doe"
                              type="text"
                              className="input"
                              id="lastName"
                              name="lastName"
                              changed={handleChange('lastName')}
                              blured={handleBlur('lastName')}
                            />
                            <Field
                              component={(props) => (
                                <TextField
                                  name="expirationDate"
                                  id="expirationDate"
                                  className="input"
                                  label="Expiration Date"
                                  type="date"
                                  onChange={handleChange('expirationDate')}
                                  onBlur={handleBlur('expirationDate')}
                                  value={values.expirationDate}
                                  // className={classes.textField}
                                  InputLabelProps={{
                                    shrink: true
                                  }}
                                />
                              )}
                            />
                            {/* <label for="name">
                              <i className="fa fa-user" /> Full Name
                            </label>
                            <Field
                              type="text"
                              className="input"
                              id="name"
                              name="name"
                              placeholder="John M. Doe"
                              value={values.name}
                              onChange={handleChange('name')}
                              onBlur={handleBlur('name')}
                            />
                            <div className="error">
                              <ErrorMessage name="name" />
                            </div> */}
                            <label for="email">
                              <i className="fa fa-envelope" /> Email
                            </label>
                            <Field
                              className="input"
                              type="email"
                              id="email"
                              value={values.email}
                              onChange={handleChange('email')}
                              onBlur={handleBlur('email')}
                              name="email"
                              placeholder="john@example.com"
                            />
                            <div className="error">
                              <ErrorMessage name="email" />
                            </div>
                            <label for="phoneNumber">
                              <i className="fa fa-address-card-o" /> Phone Number
                            </label>
                            <Field
                              className="input"
                              type="phoneNumber"
                              id="phoneNumber"
                              value={values.phoneNumber}
                              onChange={handleChange('phoneNumber')}
                              onBlur={handleBlur('phoneNumber')}
                              name="phoneNumber"
                              placeholder="+9230000000"
                            />
                            <div className="error">
                              <ErrorMessage name="phoneNumber" />
                            </div>
                            <label for="address1">
                              <i className="fa fa-address-card-o" /> Address Line 1
                            </label>
                            <Field
                              className="input"
                              type="text"
                              id="address1"
                              name="address1"
                              placeholder="542 W. 15th Street"
                              value={values.address1}
                              onChange={handleChange('address1')}
                              onBlur={handleBlur('address1')}
                            />
                            <div className="error">
                              <ErrorMessage name="address1" />
                            </div>
                            <label for="address2">
                              <i className="fa fa-street-view" /> Address Line 2
                            </label>
                            <Field
                              className="input"
                              type="text"
                              id="address2"
                              name="address2"
                              placeholder="542 W. 15th Street"
                              value={values.address2}
                              onChange={handleChange('address2')}
                              onBlur={handleBlur('address2')}
                            />
                            <div className="error">
                              <ErrorMessage name="address2" />
                            </div>

                            <label for="country">
                              <i className="fa fa-flag" /> Country
                            </label>
                            <Field
                              className="input"
                              type="text"
                              name="country"
                              placeholder="US"
                              value={values.country}
                              onChange={handleChange('country')}
                              onBlur={handleBlur('country')}
                            />
                            <div className="error">
                              <ErrorMessage name="country" />
                            </div>

                            <label for="city">
                              <i className="fa fa-institution" /> City
                            </label>
                            <Field
                              className="input"
                              type="text"
                              id="city"
                              name="city"
                              placeholder="New York"
                              value={values.city}
                              onChange={handleChange('city')}
                              onBlur={handleBlur('city')}
                            />
                            <div className="error">
                              <ErrorMessage name="city" />
                            </div>

                            <div className="row">
                              <div className="col-50">
                                <label for="state">State</label>
                                <Field
                                  className="input"
                                  type="text"
                                  id="state"
                                  name="state"
                                  placeholder="NY"
                                  value={values.state}
                                  onChange={handleChange('state')}
                                  onBlur={handleBlur('state')}
                                />
                                <div className="error">
                                  <ErrorMessage name="state" />
                                </div>
                              </div>
                              <div className="col-50">
                                <label for="zip">Zip</label>
                                <Field
                                  className="input"
                                  type="text"
                                  id="zip"
                                  name="zip"
                                  placeholder="10001"
                                  value={values.zip}
                                  onChange={handleChange('zip')}
                                  onBlur={handleBlur('zip')}
                                />
                                <div className="error">
                                  <ErrorMessage name="zip" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-50">
                            <h3>Payment</h3>
                            <label for="fname">Accepted Cards</label>
                            <div className="icon-container">
                              <i className="fa fa-cc-visa" style={{ color: 'navy' }} />
                              <i className="fa fa-cc-amex" style={{ color: 'blue' }} />
                              <i className="fa fa-cc-mastercard" style={{ color: 'red' }} />
                              <i className="fa fa-cc-discover" style={{ color: 'orange' }} />
                            </div>
                            <label for="cardName">Name on Card</label>
                            <Field
                              className="input"
                              type="text"
                              id="cardName"
                              name="cardName"
                              placeholder="John More Doe"
                              value={values.cardName}
                              onChange={handleChange('cardName')}
                              onBlur={handleBlur('cardName')}
                            />
                            <div className="error">
                              <ErrorMessage name="cardName" />
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
