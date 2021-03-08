var unirest = require('unirest');
const User = require('../models/user')
const _ = require("lodash")

const payment = async (req, response) => {
     
    const {token,email} = req.body
    User.findOne({email},(err,user)=>{
        if(err || !user){
           return response.status(400).json({error:"user with this email doesnot exist"})
          }
          if(user.isSubscribed){
            return response.status(400).json({error:"already have subscription"})

          }else{
            const obj = {
                 isSubscribed: true
              }
               user = _.extend(user,obj)
               user.save((err,result)=>{
                 if(err){
                   //res.status(401).send("cant able to set password  ")
                   console.log(err)
                   return response.status(400).json({error:"error while doing subscription,please try again!"})
               }else{
                function getsubscription() {    
                    return new Promise((resolve, reject) => {
                   var req = unirest('POST', 'https://www.2checkout.com/checkout/api/1/250774588373/rs/authService')
                  .headers({
                    'Content-Type': 'application/json',
                    'Cookie': 'visid_incap_1630256=JxVBp3/bSvm8sQEDjGvX8xt7Q2AAAAAAQUIPAAAAAAA+gMecLFNyG004jIZ/q9Df; incap_ses_1221_1630256=exOkUrpmdhOif0IfQt3xEF57Q2AAAAAARjTtKHxTGztJNq8XsOpP2g=='
                  })
                  .send(JSON.stringify({
                    "sellerId": "250774588373", 
                    "privateKey": "1D4265E2-C887-4145-B6CC-DBD23B49306F",    
                    "merchantOrderId": "123", 
                    "token":  token, 
                    "currency": "USD",
                    "demo": true,
                    "lineItems": [
                        {"name": "Package A", "price": 10, "quantity": 1, "type": "product", "recurrence": "1 Month", "duration": "Forever"}  ],
                    "billingAddr": {"name": "John Doe", "addrLine1": " village Bharaj P/O Lakhanwal", "city": "Gujrat", "state": "Pubjab", "zipCode": "50700", "country": "Pakistan", "email": "chwasiullah@gmail.com", "phoneNumber": "+923006242851"} 
                    }))
                    .end(function (response) {
                        if (response.error) {
                          return reject(response.error)
                        }
                        return resolve(response.body);
                      });
                    })
                    }
                    getsubscription() .then((body) => console.log("success", body.response.responseMsg)).catch((error) => 
                      console.log("error", error))
               }
            })
          }

        })
 }

 
exports.payment=payment
