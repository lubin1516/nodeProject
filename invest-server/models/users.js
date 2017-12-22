let mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: Number,
    userName: String,
    authCode: String,
    phone: String,
    identity: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;