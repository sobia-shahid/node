// const HttpError = require("../models/http-error");
// const { validationResult } = require("express-validator");
// const User = require("../models/user");
// let jwt = require("jsonwebtoken"); // importing jwt
//
// const { v4: uuid } = require("uuid");
//
// let DYMMY_USERS = [
//   {
//     id: "p1",
//     name: "elias",
//     email: "eliaskhs@hotmail.com",
//     password: "1234qwer"
//   },
//   {
//     id: "p2",
//     name: "elias2",
//     email: "eliaskhs@hotmail.com",
//     password: "1234qwer"
//   }
// ];
//
// const getUsers = async (req, res, next) => {
//   // verify the token by jwt here as well to return users
//   jwt.verify(req.token, "secretkey", async (error, authData) => {
//     if (error) {
//       res.sendStatus(403);
//     } else {
//       let users;
//       try {
//         users = await User.find({}, "-password");
//       } catch (err) {
//         const error = new HttpError("can not find the users", 5000);
//         return next(error);
//       }
//       res.json(users.map(user => user.toObject({ getters: true })));
//     }
//   });
// };
//
// const signUp = async (req, res, next) => {
//   const error = validationResult(req); //validator
//   if (!error.isEmpty()) {
//     return next(
//       new HttpError(
//         "unable to sign up ,invalid input passed, please check your data ",
//         422
//       )
//     );
//   }
//   const { username, email, password, places, creator } = req.body;
//
//   let existingUser;
//   try {
//     existingUser = await User.findOne({ emai: email }); // here we will check if the mail existing already
//   } catch (err) {
//     const error = new HttpError("can not sign up there is unknown error ", 500);
//     return next(error);
//   }
//   if (existingUser) {
//     const error = new HttpError(
//       "user exist already, please login instead",
//       422
//     );
//     return next(error);
//   }
//   const createdUser = new User({
//     username,
//     email,
//     image:
//       "https://upload.wikimedia.org/wikipedia/commons/b/bb/Paul_Klee_WI_%28In_Memoriam%29_1938.jpg",
//     password,
//     places,
//     creator,
//     isAdmin: req.body.isAdmin?true:false
//   });
//   createdUser.save().then(user => res.status(201).json(createdUser.toObject({ getters: true }))).catch(error => {
//     if(error.code === 11000) {
//       return res.json({message : 'Email already exists'})
//     }
//     res.json({error, message:'User cannot be created'})
//   })
//
// };
//
// const signIn = async (req, res, next) => {
//   const { email, password } = req.body;
//
//   User.findOne({ email: email, password: password })
//     .then(user => {
//       if (!user) {
//         res.json({ message: "User not found" });
//       }
//       jwt.sign({ user: user }, "secretkey", (error, token) => {
//         //console.log(token);
//         res.json({ message: "logged in", token, user });
//       });
//     })
//     .catch(error => {
//       res.json({ error });
//     });
// };
//
// exports.getUsers = getUsers;
// exports.signUp = signUp;
// exports.signIn = signIn;

const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/user')
let jwt = require('jsonwebtoken') // importing jwt
const nodemailer = require('nodemailer')
const _ = require("lodash")


const { v4: uuid } = require('uuid')

//auth to send email using nodemailer
// you simple place your email and password in user and pass
const mailTransporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: { 
      user: 'nodet245@gmail.com', //your email
      pass: '123/123node' //password
  }
})
// key used to generate token
RESET_PASSWORD_KEY = 'accountactivatekey12345'
// client url
CLIENT_URL = "http://localhost:5000"
let DYMMY_USERS = [
  {
    id: 'p1',
    name: 'elias',
    email: 'eliaskhs@hotmail.com',
    password: '1234qwer'
  },
  {
    id: 'p2',
    name: 'elias2',
    email: 'eliaskhs@hotmail.com',
    password: '1234qwer'
  }
]

const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'dd97mjjt2',
  api_key: '274253912236812',
  api_secret: 'Uwjh26mCiIyphfEC46B2Fm-LFDA'
})

const getUsers = async (req, res, next) => {
  // verify the token by jwt here as well to return users

  let users
  try {
    users = await User.find({}, '-password')
  } catch (err) {
    const error = new HttpError('can not find the users', 5000)
    return next(error)
  }
  res.json(users.map(user => user.toObject({ getters: true })))
}

// const signUp = async (req, res, next) => {
//   const error = validationResult(req) //validator
//   if (!error.isEmpty()) {
//     return next(
//       new HttpError(
//         'unable to sign up ,invalid input passed, please check your data ',
//         422
//       )
//     )
//   }
//   const { username, email, password, places, creator } = req.body
//
//   let existingUser
//   try {
//     existingUser = await User.findOne({ emai: email }) // here we will check if the mail existing already
//   } catch (err) {
//     const error = new HttpError('can not sign up there is unknown error ', 500)
//     return next(error)
//   }k
//   if (existingUser) {
//     const error = new HttpError('user exist already, please login instead', 422)
//     return next(error)
//   }
//   const createdUser = new User({
//     username,
//     email,
//     image:
//       'https://upload.wikimedia.org/wikipedia/commons/b/bb/Paul_Klee_WI_%28In_Memoriam%29_1938.jpg',
//     password,
//     places,
//     creator,
//     isAdmin: req.body.isAdmin ? true : false
//   })
//   createdUser
//     .save()
//     .then(user => res.status(201).json(createdUser.toObject({ getters: true })))
//     .catch(error => {
//       if (error.code === 11000) {
//         return res.json({ message: 'Email already exists' })
//       }
//       res.json({ error, message: 'User cannot be created' })
//     })
// }


const signUp = async (req, res, next) => {
  const error = validationResult(req) //validator
  if (!error.isEmpty()) {
    return next(
      new HttpError(
        'unable to sign up ,invalid input passed, please check your data ',
        422
      )
    )
  }
  const { username, email, password, places, creator,name,bio,website,twitter,facebook,google,linkid,instagram,resetlink,isEditor } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ emai: email }) // here we will check if the mail existing already
  } catch (err) {
    const error = new HttpError('can not sign up there is unknown error ', 500)
    return next(error)
  }
  if (existingUser) {
    const error = new HttpError('user exist already, please login instead', 422)
    return next(error)
  }
  const createdUser = new User({
    username,
    email,
    image:
      'https://res.cloudinary.com/dx1zby8rs/image/upload/v1601817748/hemdgw3pqmp0cdtujlel.png',
    password,
    places,
    creator,
    name,
    bio,
    website,
    twitter,
    facebook,
    google,
    linkid,
    instagram,
    resetlink,
    isEditor,
    isAdmin: req.body.isAdmin ? true : false
  })
  createdUser
    .save()
    .then(user => res.status(201).json(createdUser.toObject({ getters: true })))
    .catch(error => {
      if (error.code === 11000) {
        return res.json({ message: 'Email already exists' })
      }
      res.json({ error, message: 'User cannot be created' })
    })
}


const signIn = async (req, res, next) => {
  const { email, password } = req.body

  User.findOne({ email: email, password: password })
    .then(user => {
      if (!user) {
        res.json({ message: 'User not found' })
      }
      jwt.sign({ user: user }, 'secretkey', (error, token) => {
        //console.log(token);
        res.json({ message: 'logged in', token, user })
      })
    })
    .catch(error => {
      res.json({ error })
    })
}

// const updateUser = async (req, res, next) => {
//   const { uid } = req.params
//   const { username } = req.body
//
//   if (req.files) {
//     const image = req.files.image
//     const { username } = req.body
//     let imageUrl = null
//     cloudinary.uploader
//       .upload(image.tempFilePath, (error, result) => {
//         if (error) {
//           console.log('Error', error)
//         } else {
//           imageUrl = result.url
//         }
//       })
//       .then(() => {
//         User.findByIdAndUpdate(
//           uid,
//           { username, image: imageUrl },
//           { new: true }
//         )
//           .then(user => {
//             const { username, email, image } = user
//             const updatedUser = { username, email, image }
//             return res.json({ user: updatedUser })
//           })
//           .catch(error => {
//             return res.json({ error })
//           })
//       })
//       .catch(error => {
//         return res.json({ error })
//       })
//   } else {
//     User.findByIdAndUpdate(uid, { username }, { new: true }).then(user => {
//       const { username, email, image } = user
//       const updatedUser = { username, email, image }
//       return res.json({ user: updatedUser })
//     })
//   }
// }


const updateUser = async (req, res, next) => {
  const { uid } = req.params
  const { username } = req.body
  const {name} = req.body
  const {bio} = req.body
  const {website} = req.body
  const {twitter} = req.body
  const {facebook} = req.body
  const {linkid} = req.body
  const {google} = req.body
  const {instagram} = req.body

  if (req.files) {
    const image = req.files.image
    const { username } = req.body
    const {name} = req.body
    const {bio} = req.body
    const {website} = req.body
    const {twitter} = req.body
    const {facebook} = req.body
    const {linkid} = req.body
    const {google} = req.body
    const {instagram} = req.body

    let imageUrl = null
    cloudinary.uploader
      .upload(image.tempFilePath, (error, result) => {
        if (error) {
          console.log('Error', error)
        } else {
          imageUrl = result.url
        }
      })
      .then(() => {
        User.findByIdAndUpdate(
          uid,
          { username,name,bio,website,twitter,facebook,linkid,google,instagram,image: imageUrl },
          { new: true }
        )
          .then(user => {
            const { username,name,bio,website,twitter,facebook,linkid,google,instagram,email, image } = user
            const updatedUser = { sername,name,bio,website,twitter,facebook,linkid,google,instagram,email, image }
            return res.json({ user: updatedUser })
          })
          .catch(error => {
            return res.json({ error })
          })
      })
      .catch(error => {
        return res.json({ error })
      })
  } else {
    User.findByIdAndUpdate(uid, { username,name,bio,website,twitter,facebook,linkid,google,instagram }, { new: true }).then(user => {
      const { username,name,bio,website,twitter,facebook,linkid,google,instagram, email, image } = user
      const updatedUser = { username,name,bio,website,twitter,facebook,linkid,google,instagram, email, image }
      return res.json({ user: updatedUser })
    })
  }
}

const updatePassword = async (req, res, next) => {
  const { email, password, newPassword, confirmPassword } = req.body
  User.findOne({ email, password })
    .then(user => {
      if (user) {
        if (newPassword === confirmPassword) {
          const { id } = user
          User.findByIdAndUpdate(id, { password: newPassword }, { new: true })
            .then(updateUser => {
              return res.json({ user: updateUser })
            })
            .catch(error => {
              return res.json({ error })
            })
        } else {
          return res.json({
            message: 'Password and confirm password fields must match'
          })
        }
      } else {
        return res.json({ message: 'User not found' })
      }
    })
    .catch(error => {
      return res.json({ error })
    })
}

const deleteUserById = (req, res) => {
  const { id } = req.params
  console.log('id is: ', id)
  User.findOneAndDelete({ _id: id })
    .then(user => {
      if (user) {
        return res.json({ user, message: 'User deleted successfully' })
      } else {
        return res.json({ message: 'No user found by this id' })
      }
    })
    .catch(error => {
      return res.json({ message: 'User not found', error })
    })
}

const getUserById = async (req, res, next) => {
  const _id = req.params.uid
  let user
  try {
    user = await User.find({ _id: _id })
  } catch (err) {
    const error = HttpError(
      'can not find user with this user id, sorry Elias',
      500
    )
    return next(error)
  }

  if (!user || user.length === 0) {
    return next(
      new HttpError('Could not find a places for the provided id.', 404)
    )
  }
  res.json(user.map(place => place.toObject({ getters: true })))
}


 
const forgetpassword = async (req,res) => {
  // forget password 
  // when user forget his password, he simply enter a e-mail adress
  // and link with time-signed token pass to the user
  console.log("resetpass")
  const { email} = req.body;
  User.findOne({email},(err,user)=>{
      if(err || !user){
         return res.status(400).json({error:"user with this email doesnot exist"})
        }
      const token = jwt.sign({id:user.id},RESET_PASSWORD_KEY, {expiresIn: '20m'})

       console.log(token, email)
       return user.updateOne({resetlink:token}, (err, success)=>{
       if(err){
           return res.status(400).json({error:"cant able to update token"})
        }
      let mailDetails = { 
      from: 'nodet245@gmail.com', 
      to: email, 
      subject: 'Reset password link', 
      html:`<p>${CLIENT_URL}/${token}</p>`  
     
     }; 
    
     mailTransporter.sendMail(mailDetails, (err, info) => { 
      if(err) { 
          console.log(err); 
      } 
      else { 
          
          console.log(info); 
          res.send("mail is send successfuly")
      } 
  }); 

   })
  })   
}

const resetpassword = async (req, res) => {
  const {resetlink, pass} =req.body
  console.log(resetlink,pass)

  if (resetlink){
    jwt.verify(resetlink,RESET_PASSWORD_KEY, function (error,data){
        if(error){
            res.status(401).send("icorrect link or timeout")
        }
         User.findOne({resetlink},(err,user)=>{
          if(err || !user){
            return res.status(400).json({error:"user with this resetlink doesnot exist"})
           }
           const obj = {
             password : pass,
             resetlink:''
           }
            user = _.extend(user,obj)
            user.save((err,result)=>{
              if(err){
                //res.status(401).send("cant able to set password  ")
                console.log(err)
                return res.status(400).json({error:err.message})
            }
            res.send("successfully change password") 
            })
         })
        
        
    })

}else
  res.status(401).send("resetlink is not available")
}



exports.resetpassword=resetpassword
exports.forgetpassword = forgetpassword
exports.getUsers = getUsers
exports.signUp = signUp
exports.signIn = signIn
exports.updateUser = updateUser
exports.updatePassword = updatePassword
exports.deleteUserById = deleteUserById
exports.getUserById= getUserById
