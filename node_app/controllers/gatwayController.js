const stripe = require ('stripe')("sk_test_51IS74pBMi4SK1isS6vKcgILR9VDl98u5z20rIgLtjjj40wAhKxiihL7L5BzDlfPLiOAjuh94Ow2ak4v7UmONXUIS008kaaBlxD")//add your secret key here

const payment = async (req, response) => {
    const {mail,token} = req.body
    stripe.customers.create({
        email: mail,
        source : token
    },(err,customer) =>{
        if (err){
            console.log(err)
            response.status(400).send(err.raw.message)
        }
        console.log(customer)
        const {id} = customer
        stripe.subscriptions.create({
            customer:id,
            item:[{plan: premium}]
        }, (err,subscription)=>{
            if (err){
                console.log(err)
                response.status(400).send(err.raw.message)
            }
            else
            response.send("subscription is activated")
        })
    })
}

 
exports.payment=payment