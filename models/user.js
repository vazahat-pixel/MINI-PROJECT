const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/newdata');

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    age : Number,
    posts : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    Date: {
       type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('User', userSchema);