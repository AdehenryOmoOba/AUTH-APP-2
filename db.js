require('./models/user-model')
const mongoose = require('mongoose');
const uri =  DB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if(err){
      console.log('Error connecting to user_DB database!' + err)
  }else{
    console.log('Connection to user_DB database successful...')
  }
})