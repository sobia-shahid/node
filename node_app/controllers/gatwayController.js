var unirest = require('unirest');
const User = require('../models/user');
const _ = require('lodash');
const niceInvoice = require('nice-invoice');
const fs = require('fs');
const path = require('path');

const cancelSubscription = async (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'user with this email does not exist.' });
    }
    if (!user.isSubscribed) {
      return res.status(400).json({ error: 'you do not has any subscription.' });
    }

    user.isSubscribed = false;
    // user.transactionNo = null;

    user.save();
    return res.status(200).json({ success: 'unsubscribe succesfull.' });
  });
};

const payment = async (req, response) => {
  const { token, email, billingAddress } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return response.status(400).json({ error: 'user with this email doesnot exist' });
    }
    if (user.isSubscribed) {
      return response.status(400).json({ error: 'already have subscription' });
    } else {
      const obj = {
        isSubscribed: true
      };
      user = _.extend(user, obj);
      user.save((err, result) => {
        if (err) {
          //res.status(401).send("cant able to set password  ")
          console.log(err);
          return response.status(400).json({ error: 'error while doing subscription,please try again!' });
        } else {
          function getsubscription() {
            return new Promise((resolve, reject) => {
              unirest('POST', 'https://www.2checkout.com/checkout/api/1/250774588373/rs/authService')
                .headers({
                  'Content-Type': 'application/json'
                })
                .send(
                  JSON.stringify({
                    sellerId: '250774588373',
                    privateKey: '1D4265E2-C887-4145-B6CC-DBD23B49306F',
                    merchantOrderId: '123',
                    token: token,
                    currency: 'USD',
                    demo: true,
                    lineItems: [
                      {
                        name: 'Package A',
                        price: 10,
                        quantity: 1,
                        type: 'product',
                        recurrence: '1 Month',
                        duration: 'Forever'
                      }
                    ],
                    billingAddr: billingAddress
                  })
                )
                .end(function(response) {
                  if (response.error) {
                    return reject(response.error);
                  }
                  return resolve(response.body);
                });
            });
          }
          getsubscription()
            .then((body) => {
              console.log('success', body.response.responseMsg);
              console.log(body.response.total);
              const obj = {
                totalbill: body.response.total,
                streetAdress: body.response.billingAddr.addrLine1,
                city: body.response.billingAddr.city,
                country: body.response.billingAddr.country,
                postalcode: body.response.billingAddr.zipCode,
                transactionNo: body.response.transactionId
              };
              user = _.extend(user, obj);
              user.save((err, result) => {
                if (err) {
                  //res.status(401).send("cant able to set password  ")
                  console.log(err);
                  return response.status(400).json({ error: 'cant save invoice data in db' });
                }
                return response.status(200).json({ message: body.response.responseMsg });
              });
            })
            .catch((error) => console.log('error', error));
        }
      });
    }
  });
};

const invoice = async (req, res) => {
  const _id = req.params.uid;
  User.findOne({ _id }, (err, user) => {
    if (err || !user) {
      return response.status(400).json({ error: 'user with this email doesnot exist' });
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
      order_number: parseInt(user.transactionno),
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
    niceInvoice(invoiceDetail, 'your-invoice.pdf');
    // var data =fs.readFileSync('./your-invoice.pdf');
    //  res.contentType("application/pdf");
    //   res.send(data);
    res.send('successfully generate invoice');
  });
};
exports.payment = payment;
exports.unsubscribe = cancelSubscription;
exports.invoice = invoice;
