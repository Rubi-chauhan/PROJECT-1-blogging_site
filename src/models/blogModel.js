const mongoose = require('mongoose');
const authorModel = require('./authorModel');
const Objectid = mongoose.Schema.Types.ObjectId

const blogSchema = new mongoose.Schema({
     title: { type : String, required : true, trim: true}, 
     body: { type: String, required : true, trim: true}, 
     authorId: {type : Objectid, ref : 'authorModel', required : true},
     tags:[{ type: String, trim: true}], 
     category: {type: String, required: true, trim: true},  
     subcategory: [{ type: String}],
     publishedAt :{type : Date, default: Date.now()},
     isDeleted: {type: Boolean, default: false},  
     isPublished: {type: Boolean, default: false}


}, {timestamps : true});

module.exports = mongoose.model('Blog', blogSchema)