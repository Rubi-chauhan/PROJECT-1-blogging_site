const mongoose = require('mongoose');


const authorSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true,
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            }, msg: 'Please fill Valid e-mail address', isAsync: false
        }
    },
    password: {
        type: String,
        trim: true,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema)