var unirest = require('unirest');
const User = require('../models/user');
const orderHistory = require('../models/getOrderHistory');
const _ = require('lodash');
const niceInvoice = require('nice-invoice');
const fs = require('fs');
var crypto = require('crypto');
const nodemailer = require('nodemailer');

const stripe = require('stripe')(
  'sk_test_51IS74pBMi4SK1isS6vKcgILR9VDl98u5z20rIgLtjjj40wAhKxiihL7L5BzDlfPLiOAjuh94Ow2ak4v7UmONXUIS008kaaBlxD'
);
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nodet245@gmail.com', //your email
    pass: '123/123node' //password
  }
});

const subscribe = async (req, res) => {
  const { email, cvc, cardNo, expirationMonth, expirationYear } = req.body;
  console.log(email);
  User.findOne({ email }, (err, userObj) => {
    if (err || !userObj) {
      console.log(err);
      return res.status(400).json({ message: 'user with this email not found.' });
    }
    console.log(userObj.subscriptionId);
    if (userObj.subscriptionId != '') {
      return res.status(400).json({ message: 'already have subscription' });
    } else {
      (async () => {
        try {
          const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: cardNo,
              exp_month: expirationMonth,
              exp_year: expirationYear,
              cvc: cvc
            }
          });
          console.log(paymentMethod.id);

          const customer = await stripe.customers.create({
            description: 'Payment for (' + userObj.name + ')',
            name: userObj.username,
            email: userObj.email
          });
          console.log(customer.id);

          await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });

          const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [ { price: 'price_1IVZpBBMi4SK1isSYD6DVcLY' } ],
            default_payment_method: paymentMethod.id
          });
          console.log(subscription.id);
          const obj = {
            subscriptionId: subscription.id,
            customerId: customer.id
          };
          userObj = _.extend(userObj, obj);
          userObj.save(async (err, result) => {
            if (err) {
              console.log(err);
              return res.status(400).json({ message: 'Unable to subscribe. Please try again.' });
            } else {
              // getting the invoice from provided subscription
              const invoice = await stripe.invoices.retrieve('in_1IV7KGBMi4SK1isSUpp3p05a');

              const mailContent = `<h1 style="color: #5e9ca0;">Subscription Sucessful</h1>
  <h2 style="color: #2e6c80;">You have subscribed as a premieum user.</h2>
  <p>You can get the reciept of your subscription with the links below.</p>
  <a href=${invoice.hosted_invoice_url} target="_blank">Click to view PDF</a>
  <br />
  <a href=${invoice.invoice_pdf} target="_blank">Click to dowload reciept.</a>`;

              sendEmail(mailContent, userObj.email, 'Subscription Successful');

              return res
                .status(200)
                .json({ subscriptionId: subscription.id, customerId: customer.id, message: 'Subscribed Succesfully.' });
            }
          });
        } catch (err) {
          console.log(err);
          return res.status(400).json({ message: err.raw.message });
        }
      })();
    }
  });
};

const cancelSubscription = async (req, res) => {
  const subscriptionId = req.params.subid;
  console.log(subscriptionId);
  User.findOne({ subscriptionId }, (err, userObj) => {
    if (err) {
      res.status(400).json({ message: 'User with this subscription found.' });
    } else {
      (async () => {
        try {
          const deleted = await stripe.subscriptions.del(subscriptionId);
          const invoice = await stripe.invoices.retrieve(deleted.latest_invoice);
          const refund = await stripe.refunds.create({ charge: invoice.charge });
          obj = {
            subscriptionId: '',
            customerId: ''
          };
          userObj = _.extend(userObj, obj);
          userObj.save((err, result) => {
            if (err) {
              return res.status(400).json({ message: 'unable to cancel subscription' });
            } else {
              const emailContent = `<h1 style="color: #5e9ca0;">Amount Refund on Unsubscription.</h1>
              <h2 style="color: #2e6c80;">You have unsubscribed from a premium user.</h2>
              <p>You recieved refund amount on unsubscription.</p><table><tr><th>Amount</th><th>Currency</th>
              </tr><tr><td>${refund.amount / 100}</td><td>${refund.currency}</td></tr></table>`;
              sendEmail(emailContent, userObj.email, 'Unsubscribed Successfuly.');
              return res.status(200).json({ message: 'Sucessfully unsubscribed.' });
            }
          });
        } catch (error) {
          console.log(error);
          return res.status(400).json(error);
        }
      })();
    }
  });
};

const getReciepts = async (req, res) => {
  console.log('Came here.');
  const { customerId } = req.params;
  try {
    const reciepts = await stripe.invoices.list({
      customer: customerId
    });
    const refinedReciepts = reciepts.data.map((r) => ({
      createdAt: r.created,
      currency: r.currency,
      reason: r.billing_reason,
      amount: r.amount_paid,
      status: r.status,
      subscription: r.subscription,
      hostedUrl: r.hosted_invoice_url,
      downloadUrl: r.invoice_pdf,
      customerId: r.customer
    }));
    return res.status(200).json(refinedReciepts);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

const sendEmail = (content, email, subject) => {
  const mailDetails = {
    from: 'nodet245@gmail.com',
    to: email,
    subject: subject,
    html: content
  };

  mailTransporter.sendMail(mailDetails, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

exports.cancelSubscription = cancelSubscription;
exports.reciepts = getReciepts;
exports.subscribe = subscribe;
