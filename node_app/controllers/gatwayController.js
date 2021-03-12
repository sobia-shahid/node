var unirest = require('unirest');
const User = require('../models/user');
const _ = require('lodash');
const niceInvoice = require('nice-invoice');
const fs = require('fs');
var crypto = require('crypto');

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
    if (userObj.subscriptionId != '') {
      return res.status(400).json({ message: 'already have subscription' });
    } else {
      const date = new Date()
        .toISOString()
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, '');

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
        ExternalSubscriptionReference: '12235',
        NextRenewalPrice: 49.99,
        NextRenewalPriceCurrency: 'usd',
        PartnerCode: '',
        Payment: card,
        // Payment: {
        //   CCID: '123',
        //   CardNumber: '4111111111111111',
        //   CardType: 'Visa',
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
        StartDate: '2015-02-16',
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
            return res.status(400).json({ message: response.body });
          } else {
            const obj = {
              subscriptionId: response.body
            };
            userObj = _.extend(userObj, obj);
            userObj.save((err, result) => {
              if (err) {
                return res.status(400).json({ message: 'cant able to get subscription' });
              } else {
                return res
                  .status(200)
                  .json({ subscriptionId: response.body.message, message: 'Subscribed Succesfully.' });
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
  User.findOne({ subscriptionId: sub_id }, (err, user) => {
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

      unirest('DELETE', `https://api.2checkout.com/rest/6.0/subscriptions/${sub_id}/`)
        .headers({
          'X-Avangate-Authentication': authHeader,
          'Content-Type': 'application/json'
        })
        .end(function(response) {
          if (response.error) {
            console.log(response.error);
            return res.status(400).json({ message: response.error });
          } else {
            obj = {
              subscriptionId: ''
            };
            user = _.extend(user, obj);
            user.save();
            console.log(user);
            return res.status(200).json({ message: response.body });
          }
        });
    }
  });
};

const getSubscriptionPayments = async (req, res) => {
  const sub_id = req.params.subid;
  const vender_code = '250775193652';

  const date = new Date()
    .toISOString()
    .replace(/T/, ' ') // replace T with a space
    .replace(/\..+/, '');

  const msg = vender_code.length + vender_code + date.length + date;

  const hmac = crypto.createHmac('md5', '0~Q?wlT%b#uKRSUiPX!T');
  data = hmac.update(msg);
  hash = data.digest('hex');
  console.log('hmac : ' + hash);

  const authHeader = `code="${vender_code}" date="${date}" hash="${hash}"`;

  // var req = unirest('GET', `https://api.2checkout.com/rest/6.0/subscriptions/${sub_id}/`)
  var req = unirest('GET', `https://api.2checkout.com/rest/6.0/subscriptions/${sub_id}/history/`)
    .headers({
      'X-Avangate-Authentication': authHeader,
      'Content-Type': 'application/json'
    })
    .end(function(response) {
      if (response.error) {
        console.log(response);
        return res.status(400).json(response);
      }
      console.log(response.body);
      return res.status(200).json(response);
    });
};

const getAuth = (req, res) => {
  const vender_code = '250775193652';

  const date = new Date()
    .toISOString()
    .replace(/T/, ' ') // replace T with a space
    .replace(/\..+/, '');

  const msg = vender_code.length + vender_code + date.length + date;

  const hmac = crypto.createHmac('md5', '0~Q?wlT%b#uKRSUiPX!T');
  data = hmac.update(msg);
  hash = data.digest('hex');
  console.log('hmac : ' + hash);

  authHeader = `code="${vender_code}" date="${date}" hash="${hash}"`;
  res.status(200).json(authHeader);
};

//const {token,email} = req.body
// User.findOne({email},(err,user)=>{
//     if(err || !user){
//        return response.status(400).json({error:"user with this email doesnot exist"})
//       }
//       if(user.isSubscribed){
//         return response.status(400).json({error:"already have subscription"})

//       }else{
//         const obj = {
//              isSubscribed:  !true
//           }
//            user = _.extend(user,obj)
//            user.save((err,result)=>{
//              if(err){
//                //res.status(401).send("cant able to set password  ")
//                console.log(err)
//                return response.status(400).json({error:"error while doing subscription,please try again!"})
//            }else{
//             function getsubscription() {
//                 return new Promise((resolve, reject) => {
//                var req = unirest('POST', 'https://www.2checkout.com/checkout/api/1/250774588373/rs/authService')
//               .headers({
//                 'Content-Type': 'application/json',
//                 'Cookie': 'visid_incap_1630256=JxVBp3/bSvm8sQEDjGvX8xt7Q2AAAAAAQUIPAAAAAAA+gMecLFNyG004jIZ/q9Df; incap_ses_1221_1630256=exOkUrpmdhOif0IfQt3xEF57Q2AAAAAARjTtKHxTGztJNq8XsOpP2g=='
//               })
//               .send(JSON.stringify({
//                 "sellerId": "250774588373",
//                 "privateKey": "1D4265E2-C887-4145-B6CC-DBD23B49306F",
//                 "merchantOrderId": "123",
//                 "token":  token,
//                 "currency": "USD",
//                 "demo": true,
//                 "lineItems": [
//                     {"name": "Package A", "price": 10, "quantity": 1, "type": "product", "recurrence": "1 Month", "duration": "Forever"}  ],
//                 "billingAddr": {"name": "John Doe", "addrLine1": " village Bharaj P/O Lakhanwal", "city": "Gujrat", "state": "Pubjab", "zipCode": "50700", "country": "Pakistan", "email": "chwasiullah@gmail.com", "phoneNumber": "+923006242851"}
//                 }))
//                 .end(function (response) {
//                     if (response.error) {
//                       return reject(response.error)
//                     }
//                     return resolve(response.body);
//                   });
//                 })
//                 }
//                 getsubscription() .then((body) =>{
//                    console.log("success", body.response.responseMsg)
//                    console.log(body.response.total)
//                    const obj = {
//                     totalbill: body.response.total,
//                     streetAdress:body.response.billingAddr.addrLine1,
//                     state:body.response.billingAddr.state,
//                     city:body.response.billingAddr.city,
//                     country:body.response.billingAddr.country,
//                     postalcode:body.response.billingAddr.zipCode,
//                     transactionno:body.response.transactionId
//                  }
//                   user = _.extend(user,obj)
//                   user.save((err,result)=>{
//                     if(err){
//                       //res.status(401).send("cant able to set password  ")
//                       console.log(err)
//                       return response.status(400).json({error:"cant save invoice data in db"})
//                   }
//                   return response.status(200).json({message:body.response.responseMsg})
//                   })

//                   })
//                   .catch((error) =>
//                   console.log("error", error))
//            }
//         })
//       }

//     })

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

    var stream = fs.createReadStream('D:/reacttut/clientwork/node/node_app/new-invoice.pdf');
    var filename = 'new-invoice.pdf';
    filename = encodeURIComponent(filename);
    res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
    stream.pipe(res);
  });
};

exports.auth = getAuth;
exports.subscribe = subscribe;
exports.payments = getSubscriptionPayments;
exports.unsubscribe = cancelSubscription;
exports.invoice = invoice;
