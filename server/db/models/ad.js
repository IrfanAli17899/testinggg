const mongoose  = require('mongoose');

const AdSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        trim: true
    },
    category: {
        type: String,
        required: true,
    },
    src: {
        type: String,
        required: true
    },
    adDate: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
        minlength: 2
    },
    model: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        trim: true
    },
    sellerId:{
        type:String,
        required:true
    },
    contact:{
        type:String,
        required:true
    }

})

const Ad = mongoose.model('Ad', AdSchema);
module.exports = { Ad }