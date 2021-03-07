const HttpError = require('../models/http-error')
const { v4: uuid } = require('uuid')
const Like = require('../models/like')
const Place = require('../models/place')
const fs = require('fs')

const getLike = async (req, res, next) => {
  Like.find()
    .exec()
    .then((like) => res.json(like))
    .catch((err) => next(err));
}

const createlike = async (req, res, next) => {
  const { uuid2 } = req.body
  const like = new Like({uuid2});
  await like.save()
    .then(() => res.json(like))
    .catch((err) => next(err));
}

const increLike = async (req, res, next) => {
  const userId = req.body.userId;
  if(!userId) {
    res.status(404).json({message: 'UserId is missed'})
    return;
  }
  Like.findById(req.params.id)
    .exec()
    .then((like) => {
      if (like.users) {
        const users = JSON.parse(like.users);
        const index = users.findIndex(id => id === userId);
        if (index < 0) {
          users.push(userId);
          like.count++;
          like.users = JSON.stringify(users);
          like.save()
            .then(() => res.json(like))
            .catch((err) => next(err));
        } else {
          res.json(like)
        }
      } else {
        like.count++;
        like.users = JSON.stringify([userId]);
        like.save()
          .then(() => res.json(like))
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
}
const decreLike = async (req,res,next)=>{
  const userId = req.body.userId;  
  if(!userId) {
    res.status(404).json({message: 'UserId is missed'})
    return;
  }
  Like.findById(req.params.id)
    .exec()
    .then((like) => {
      if (like.users) {
        const users = JSON.parse(like.users);
        const index = users.findIndex(id => id === userId);
        if (index < 0) {
          res.json(like)
        } else {
          users.splice(index,1);
          like.count--;
          like.users = JSON.stringify(users);
          like.save()
            .then(() => res.json(like))
            .catch((err) => next(err));
        }
      } else {
        res.json(like);
      }
    })
    .catch((err) => next(err));
}
const cleanLikes = async (req,res,next)=>{
  try {
    const likes = await Like.find().exec();
    likes.map(async (like) => {
      const place = await Place.findOne({uuid2: like.uuid2}).exec();
      if(place === null) {
        await Like.findOneAndDelete({ uuid2: like.uuid2 }).exec();
        console.log('like deleted =>', like);
      } else {
        console.log('place =>', place);
      }
    })
    return res.status(200).json({message: 'likes cleaned'});
  } catch (err) {
    return next(err);
  }
 
    
}

const deleteLike = async (uuid2) => {
  Like.findOneAndDelete({ uuid2: uuid2 })
    .exec()
    .then(() => uuid2 )
    .catch((err)=> err );
}

exports.getLike= getLike
exports.createlike= createlike
exports.increLike = increLike
exports.decreLike= decreLike
exports.deleteLike = deleteLike
exports.cleanLikes = cleanLikes

