const mongoose = require('mongoose');


const authorSchema = new mongoose.Schema({
    Fname : {type: String, required : true},
    Lname : {type: String,required : true},
    title: {type: String, required : true, enum:["Mr", "Mrs", "Miss"]},
    email : {type: String, required: true, match: /.+\@.+\..+/ , unique:true},
    password : {type: String, required: true}

},{timestamps:true});

module.exports = mongoose.model('Author', authorSchema)