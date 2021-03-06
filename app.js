const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload')
const HttpError = require('./models/http-error')
const placesRouter = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const threeDRoutes = require('./routes/threeD-routes')
const tourRoutes = require('./routes/tour-routes')
const userTourRoutes = require('./routes/userTour-routes')
const counterRoutes = require('./routes/counter-routes')
const likeRoutes = require('./routes/like-routes')
const hotSpotIconRoutes = require('./routes/hotSpotIcon-routes')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

app.use(bodyParser.json())
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   )
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//
//   next()
// })

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Headers'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT');

  next();
});

app.use(
  fileUpload({
    useTempFiles: true
  })
)

app.use('/uploads', express.static('uploads'))
app.use('/api/places', placesRouter) //=> /api/places/...
app.use('/api/users', usersRoutes)
app.use('/api/three', threeDRoutes)
app.use('/api/tours', tourRoutes)
app.use('/api/usertours', userTourRoutes)
app.use('/api/counter', counterRoutes)
app.use('/api/like',likeRoutes)
app.use('/api/icons',hotSpotIconRoutes)

app.use(express.static(path.join(__dirname,'client', 'build')));
//serve static assets if in production
// if(process.env.NODE_ENV === 'production') {
app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname,'client', 'build', 'index.html'));
});
// }

app.use((req, res, next) => {  
  const error = new HttpError('Could not find this route', 404)
  throw error
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    // if there is almost error sent, then no need to send other error,if no then send  res.status(error.code || 500);
    return next(error)
  }
  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error accurred !' })
})

app.use(cors());

mongoose
  .connect(
    'mongodb+srv://elias:ilovegreece1984@cluster0-e02ov.mongodb.net/places?retryWrites=true&w=majority',
    // 'mongodb+srv://elias:elias@cluster0.jmuxz.mongodb.net/<dbname>?retryWrites=true&w=majority',
    // 'mongodb+srv://luna:luna@cluster0.czh2u.mongodb.net/<dbname>?retryWrites=true&w=majority',

    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  )
  .then(() => {
    console.log('server is listening now')
    app.listen(process.env.PORT || 5000)
  })
  .catch(err => {
    console.log(err)
  })
