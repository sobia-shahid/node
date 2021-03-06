const unirest = require ('unirest')
const payment = async (req, response) => {
    const {token}=req.body
    console.log("payment method")
    let request = unirest('POST', 'https://www.2checkout.com/checkout/api/1/250774588373/rs/authService')
    .headers({
    'Content-Type': 'application/json',
    'Cookie': 'visid_incap_1630256=JxVBp3/bSvm8sQEDjGvX8xt7Q2AAAAAAQUIPAAAAAAA+gMecLFNyG004jIZ/q9Df; incap_ses_1221_1630256=exOkUrpmdhOif0IfQt3xEF57Q2AAAAAARjTtKHxTGztJNq8XsOpP2g=='
      })
  .send(JSON.stringify({"sellerId":"250774588373","privateKey":"1D4265E2-C887-4145-B6CC-DBD23B49306F","merchantOrderId":"123","token":token,"currency":"USD","demo":true,"lineItems":[{"name":"Package A","price":"5.99","type":"Package","quantity":"1","recurrence":"1 Month","startupFee":"9.99","duration":"forever"}],"billingAddr":{"name":"testing tester","addrLine1":"123 test blvd","city":"columbus","state":"Ohio","zipCode":"43123","country":"USA","email":"example@2co.com","phoneNumber":"123456789"}}))
  .end(function (err,res) { 
    
    //if (res.error) throw new Error(res.error); 
    if (err) {
        console.log(err.raw_body)
        response.status(400).send(err.raw_body)
    } 
    else{
        console.log(res);
        response.status(200).json({message:"subscription is done successfully"})
    }
      
    })
}

 
exports.payment=payment