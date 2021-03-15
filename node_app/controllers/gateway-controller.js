var unirest = require('unirest');
const User = require('../models/user');
const orderHistory = require('../models/getOrderHistory');
const _ = require('lodash');
const niceInvoice = require('nice-invoice');
const fs = require('fs');
var crypto = require('crypto');
const stripe = require('stripe')(
  'sk_test_51IS74pBMi4SK1isS6vKcgILR9VDl98u5z20rIgLtjjj40wAhKxiihL7L5BzDlfPLiOAjuh94Ow2ak4v7UmONXUIS008kaaBlxD'
);

const saveHistory = async (req, res) => {
  const history = req.body;
  console.log(history);
  var hist = new orderHistory(history);
  hist.save((err, sucess) => {
    if (err) {
      res.status(400).json({ message: err });
    } else {
      res.status(200).json({ message: sucess });
    }
  });
};

const getHistory = async (req, res) => {
  let users;
  try {
    users = await orderHistory.find({});
  } catch (err) {
    const error = new HttpError('can not find the users', 5000);
    return next(error);
  }
  res.json(users.map((user) => user.toObject({ getters: true })));
};

const subscribe = async (req, res) => {
  const vender_code = '250775193652';
  //const {user} = req.body
  const { user, card, ExpirationDate } = req.body;
  const { Email } = user;
  console.log(Email);
  User.findOne({ email: Email }, (err, userObj) => {
    if (err || !userObj) {
      console.log(err);
      return res.status(400).json({ message: 'user with this email not found.' });
    }
    console.log(userObj.subscriptionId);
    if (userObj.subscriptionId != '' && false) {
      return res.status(400).json({ message: 'already have subscription' });
    } else {
      const date = new Date()
        .toISOString()
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, '');
      console.log(date);

      const msg = vender_code.length + vender_code + date.length + date;

      const hmac = crypto.createHmac('md5', '0~Q?wlT%b#uKRSUiPX!T');
      data = hmac.update(msg);
      hash = data.digest('hex');
      console.log('hmac : ' + hash);

      const authHeader = `code="${vender_code}" date="${date}" hash="${hash}"`;
      const obj = {
        CustomPriceBillingCyclesLeft: 2,
        DeliveryInfo: {
          Codes: [
            {
              Code: '___TEST___CODE____'
            }
          ]
        },
        EndUser: user,
        // EndUser: {
        //   Address1: 'Test Address',
        //   Address2: '',
        //   City: 'LA',
        //   Company: '', //
        //   CountryCode: 'us',
        //   Email: 'customer@2Checkout.com',
        //   Fax: '', //
        //   FirstName: 'Customer',
        //   Language: 'en', //
        //   LastName: '2Checkout',
        //   Phone: '',
        //   State: 'CA',
        //   Zip: '12345'
        // },
        //ExpirationDate: '2015-12-16',
        ExpirationDate: ExpirationDate,
        NextBillingDate: date.toString(),
        ExternalSubscriptionReference: new Date().getUTCMilliseconds(),
        // SubscriptionCode: new Date().getUTCMilliseconds(),
        NextRenewalPrice: 49.99,
        NextRenewalPriceCurrency: 'usd',
        PartnerCode: '',
        Payment: card,
        // Payment: {
        //   CCID: '123',
        //   CardNumber: '3566111111111113',
        //   CardType: 'JCB',
        //   ExpirationMonth: '12',
        //   ExpirationYear: '2018',
        //   HolderName: 'John Doe'
        // },
        Product: {
          ProductCode: 'XZXVWTAHH7',
          ProductId: '34702111',
          ProductName: '2Checkout Subscription',
          ProductQuantity: 1,
          ProductVersion: ''
        },
        StartDate: date.toString(),
        SubscriptionValue: 199,
        SubscriptionValueCurrency: 'usd',
        Test: 1
      };

      unirest('POST', 'https://api.2checkout.com/rest/6.0/subscriptions/')
        .headers({
          'X-Avangate-Authentication': authHeader,
          'Content-Type': 'application/json'
        })
        .send(obj)
        .end(function(response) {
          if (response.body.error_code) {
            console.log(response);
            return res.status(400).json({ message: response.body.message });
          } else {
            const obj = {
              subscriptionId: response.body
            };
            userObj = _.extend(userObj, obj);
            userObj.save((err, result) => {
              if (err) {
                return res.status(400).json({ message: 'cant able to get subscription' });
              } else {
                return res.status(200).json({ subscriptionId: response.body, message: 'Subscribed Succesfully.' });
              }
            });
          }
        });
    }
  });
};

const cancelSubscription = async (req, res) => {
  const sub_id = req.params.subid;
  console.log(sub_id);
  User.findOne({ subscriptionId: sub_id }, (err, userObj) => {
    if (err) {
      res.status(400).json({ message: 'subscription  not found' });
    } else {
      const vender_code = '250775193652';

      const date = new Date()
        .toISOString()
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, '');

      const msg = vender_code.length + vender_code + date.length + date;
      console.log(msg);

      const hmac = crypto.createHmac('md5', '0~Q?wlT%b#uKRSUiPX!T');
      data = hmac.update(msg);
      const hash = data.digest('hex');
      console.log('hmac : ' + hash);

      const authHeader = `code="${vender_code}" date="${date}" hash="${hash}"`;
      console.log(authHeader);

      unirest('DELETE', `https://api.2checkout.com/rest/6.0/subscriptions/${sub_id}`)
        .headers({
          'X-Avangate-Authentication': authHeader,
          'Content-Type': 'application/json'
        })
        .end(function(response) {
          //console.log(response.body.error_code)

          if (response.body.error_code) {
            //   console.log(response.body);
            return res.status(400).json(response.body);
          } else {
            obj = {
              subscriptionId: ''
            };
            userObj = _.extend(userObj, obj);
            userObj.save();
            console.log(userObj);
            return res.status(200).json(response.body);
          }
        });
    }
  });
};

const getSubscriptionPayments = async (req, res) => {
  const subId = req.params.subid;
  const vendorCode = '250775193652';

  const date = new Date()
    .toISOString()
    .replace(/T/, ' ') // replace T with a space
    .replace(/\..+/, '');

  const msg = vendorCode.length + vendorCode + date.length + date;

  const hmac = crypto.createHmac('md5', '0~Q?wlT%b#uKRSUiPX!T');
  data = hmac.update(msg);
  hash = data.digest('hex');
  console.log('hmac : ' + hash);

  const authHeader = `code="${vendorCode}" date="${date}" hash="${hash}"`;

  const orderObj = {
    test: 1,
    Country: 'us',
    Currency: 'USD',
    CustomerIP: '91.220.121.21',
    ExternalReference: 'REST_API_AVANGTE',
    Language: 'en',
    Source: 'testAPI.com',
    ProductCode: 'XZXVWTAHH7',
    BillingDetails: {
      Address1: 'Test Address',
      City: 'LA',
      State: 'California',
      CountryCode: 'US',
      Email: 'Nodet123@gmail.com',
      FirstName: 'Customer',
      LastName: '2Checkout',
      Zip: '12345'
    },
    Items: [
      {
        Name: 'Dynamic product',
        Description: 'Test description',
        Quantity: 1,
        IsDynamic: true,
        Tangible: false,
        PurchaseType: 'PRODUCT',
        CrossSell: {
          CampaignCode: 'CAMPAIGN_CODE',
          ParentCode: 'MASTER_PRODUCT_CODE'
        },
        Price: {
          Amount: 100,
          Type: 'CUSTOM'
        },
        PriceOptions: [
          {
            Name: 'OPT1',
            Options: [
              {
                Name: 'Name LR',
                Value: 'Value LR',
                Surcharge: 7
              }
            ]
          }
        ],
        RecurringOptions: {
          CycleLength: 2,
          CycleUnit: 'DAY',
          CycleAmount: 12.2,
          ContractLength: 3,
          ContractUnit: 'DAY'
        }
      }
    ],
    PaymentDetails: {
      Type: 'CC',
      Currency: 'USD',
      CustomerIP: '91.220.121.21',
      PaymentMethod: {
        CardNumber: '4111111111111111',
        CardType: 'VISA',
        // Vendor3DSReturnURL: 'www.success.com',
        // Vendor3DSCancelURL: 'www.fail.com',
        ExpirationYear: '2021',
        ExpirationMonth: '12',
        CCID: '123',
        HolderName: 'John Doe',
        RecurringEnabled: true,
        HolderNameTime: 1,
        CardNumberTime: 1
      }
    }
  };
  unirest('POST', `https://api.2checkout.com/rest/6.0/orders/`)
    // var req = unirest('GET', `https://api.2checkout.com/rest/6.0/subscriptions/${subId}/`)
    .headers({
      'X-Avangate-Authentication': authHeader,
      'Content-Type': 'application/json'
    })
    .send(orderObj)
    // .send({
    //   ExpirationDate: '2021-11-12',
    //   NextBillingDate: new Date(),
    //   RecurringEnabled: true,
    //   SubscriptionEnabled: true
    // })
    .end(function(response) {
      if (response.error) {
        // console.log(response);
        return res.status(400).json(response);
      }
      // console.log(response.body);
      return res.status(200).json(response);
    });
};

const invoice = async (req, res) => {
  const _id = req.params.uid;
  User.findOne({ _id }, (err, user) => {
    if (err || !user) {
      return response.status(400).json({ error: 'User with this email not found.' });
    }
    console.log(user);
    d = new Date();
    const invoiceDetail = {
      shipping: {
        name: user.username,
        address: user.streetAdress,
        city: user.city,
        state: user.state,
        country: user.country,
        postal_code: user.postalcode
      },
      items: [
        {
          item: 'Subscription ',
          description: 'Premium plan of month',
          quantity: 1,
          price: parseInt(user.totalbill),
          tax: '0%'
        }
      ],
      subtotal: parseInt(user.totalbill),
      total: parseInt(user.totalbill),
      order_number: parseInt(user.transactionNo),
      header: {
        company_name: 'WalkinBack',
        company_logo: '',
        company_address: 'www.walkinBack.com'
      },
      footer: {
        text: 'please make the check payable to the company name'
      },
      currency_symbol: '$',
      date: {
        billing_date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
        due_date: `${d.getDate() + 15}/${d.getMonth() + 1}/${d.getFullYear()}`
      }
    };
    niceInvoice(invoiceDetail, 'new-invoice.pdf');

    var stream = fs.createReadStream(__basedir + '/new-invoice.pdf');
    var filename = 'new-invoice.pdf';
    filename = encodeURIComponent(filename);
    res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
    stream.pipe(res);
  });
};

const subscribeNow = async (req, res) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 3,
        exp_year: 2022,
        cvc: '314'
      }
    });
    console.log(paymentMethod.id);

    const customer = await stripe.customers.create({
      description: 'My First Test customer'
      // invoice_settings: { default_payment_method: paymentMethod.id }
    });
    console.log(customer.id);

    await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [ { price: 'price_1IS797BMi4SK1isSTxOBKGa5' } ],
      default_payment_method: paymentMethod.id
    });
    console.log(subscription.id);

    return res.status(200).json(subscription);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
};

const unsubscribeNow = async (req, res) => {
  const subId = req.params.subid;

  try {
    const deleted = await stripe.subscriptions.del(subId);
    return res.status(204).json(deleted);
  } catch (error) {
    return res.status(400).json(error);
  }
};

const getReciept = async (req, res) => {
  const customerId = 'cus_J7NYXlnEd4tFBp';

  try {
    const subscriptions = await stripe.invoices.list({
      // limit: 10,
      customer: customerId
    });
    return res.status(200).json(subscriptions);
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.subscribe = subscribe;
exports.payments = getSubscriptionPayments;
exports.invoice = invoice;
exports.savehistory = saveHistory;
exports.gethistory = getHistory;

exports.order = subscribeNow;
exports.unsubscribe = unsubscribeNow;
exports.reciept = getReciept;
