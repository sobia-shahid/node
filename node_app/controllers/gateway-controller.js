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
   
  const  {email}  = req.body;
  console.log(email);
  User.findOne({email}, (err, userObj) => {
    if (err || !userObj) {
      console.log(err);
      return res.status(400).json({ message: 'user with this email not found.' });
    }
    console.log(userObj.subscriptionId);
    if (userObj.subscriptionId != '') {
        return res.status(400).json({ message: 'already have subscription' });
    } else {
      
      (async () =>{ 
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
        const obj = {
              subscriptionId: subscription.id,
              customerId:customer.id
            };
            userObj = _.extend(userObj, obj);
            userObj.save((err, result) => {
              if (err) {
                return res.status(400).json({ message: 'cant able to get subscription' });
              } else {
                return res.status(200).json({ subscriptionId: subscription.id, message: 'Subscribed Succesfully.' });
              }
            });
          }
          catch (err) {
            console.log(err);
            return res.status(400).json(err);
          }
        })();
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
    // console.log(userObj)
      (async ()=>{ 
        console.log(userObj) 
      try {
        const deleted = await stripe.subscriptions.del(sub_id);
         
        obj = {
          subscriptionId: '',
          customerId:''
        };
        userObj = _.extend(userObj, obj);
        userObj.save((err, result) => {
          if (err) {
            return res.status(400).json({ message: 'cant able to cancel subscription' });
          } else {
            return res.status(200).json({message:"Sucessfully unsubscribe"});
          }
        });
      }catch (error) {
        console.log(error)
        return res.status(400).json(error);
      }
    })()
           
          }
      
     
    
  });
};

 

// const invoice = async (req, res) => {
//   const _id = req.params.uid;
//   User.findOne({ _id }, (err, user) => {
//     if (err || !user) {
//       return response.status(400).json({ error: 'User with this email not found.' });
//     }
//     console.log(user);
//     d = new Date();
//     const invoiceDetail = {
//       shipping: {
//         name: user.username,
//         address: user.streetAdress,
//         city: user.city,
//         state: user.state,
//         country: user.country,
//         postal_code: user.postalcode
//       },
//       items: [
//         {
//           item: 'Subscription ',
//           description: 'Premium plan of month',
//           quantity: 1,
//           price: parseInt(user.totalbill),
//           tax: '0%'
//         }
//       ],
//       subtotal: parseInt(user.totalbill),
//       total: parseInt(user.totalbill),
//       order_number: parseInt(user.transactionNo),
//       header: {
//         company_name: 'WalkinBack',
//         company_logo: '',
//         company_address: 'www.walkinBack.com'
//       },
//       footer: {
//         text: 'please make the check payable to the company name'
//       },
//       currency_symbol: '$',
//       date: {
//         billing_date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
//         due_date: `${d.getDate() + 15}/${d.getMonth() + 1}/${d.getFullYear()}`
//       }
//     };
//     niceInvoice(invoiceDetail, 'new-invoice.pdf');

//     var stream = fs.createReadStream(__basedir + '/new-invoice.pdf');
//     var filename = 'new-invoice.pdf';
//     filename = encodeURIComponent(filename);
//     res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
//     res.setHeader('Content-type', 'application/pdf');
//     stream.pipe(res);
//   });
// };

// const subscribeNow = async (req, res) => {
//   try {
//     const paymentMethod = await stripe.paymentMethods.create({
//       type: 'card',
//       card: {
//         number: '4242424242424242',
//         exp_month: 3,
//         exp_year: 2022,
//         cvc: '314'
//       }
//     });
//     console.log(paymentMethod.id);

//     const customer = await stripe.customers.create({
//       description: 'My First Test customer'
//       // invoice_settings: { default_payment_method: paymentMethod.id }
//     });
//     console.log(customer.id);

//     await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });

//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [ { price: 'price_1IS797BMi4SK1isSTxOBKGa5' } ],
//       default_payment_method: paymentMethod.id
//     });
//     console.log(subscription.id);

//     return res.status(200).json(subscription);
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json(err);
//   }
// };

// const unsubscribeNow = async (req, res) => {
//   const subId = req.params.subid;

//   try {
//     const deleted = await stripe.subscriptions.del(subId);
//     return res.status(204).json(deleted);
//   } catch (error) {
//     return res.status(400).json(error);
//   }
// };

const getReciept = async (req, res) => {
  const sub_id = req.params.subid;
  console.log(sub_id);
  User.findOne({ subscriptionId: sub_id }, (err, userObj) => {
    if (err) {
      res.status(400).json({ message: 'subscription  not found' });
    } else {
    // console.log(userObj)
      (async ()=>{ 
        console.log(userObj.customerId) 
      try {
        const subscriptions = await stripe.invoices.list({
        // limit: 10,
        customer: userObj.customerId
      });
      return res.status(200).json(subscriptions.data[0].invoice_pdf);
         
      }catch (error) {
        console.log(error)
        return res.status(400).json(error);
      }
    })()     
          }
  });
};

exports.subscribe = subscribe;
//exports.payments = getSubscriptionPayments;
//exports.invoice = invoice;
exports.savehistory = saveHistory;
exports.gethistory = getHistory;

//exports.order = subscribeNow;
exports.cancelSubscription = cancelSubscription;
exports.reciept = getReciept;
