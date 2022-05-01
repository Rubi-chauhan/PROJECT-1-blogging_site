
const isemail = require('isemail');
// const validator =require("validator")
const authorModel = require('../models/authorModel');
const jwt = require("jsonwebtoken");

const isValid = function(value)
{
    if(typeof value === 'undefined' || value === null){
        return false
    }
    if(typeof value === 'string' && value.trim().length == 0){
        return false
    }
    return true

} 

const isValidTitle = function(title){
    return ["Mr", "Mrs","Miss"].includes(title)
}

const isValidUserInput = function(data){
    return Object.keys(data).length>0
}

const createAuthor = async function(req,res){
    try{

    let data = req.body
    let {Fname, Lname, title, email, password}= data

    if(!isValidUserInput(data)){
        return res.status(400).send({status:false, msg : "Please provide author details"})
    }

    if(!isValid(Fname))
    return res.status(400).send({status:false, msg : "First name is required"})

    if(!isValid(Lname))
    return res.status(400).send({status:false, msg : "Last name is required"})

    if(!isValid(title))

    return res.status(400).send({status:false, msg:"Title is required"})

    if (!isValidTitle(data.title)) {
        return res.status(400).send({ status: false, message: "Valid title required" })
    }

    if(!isValid(email))
    return res.status(400).send({status:false, msg:"E-mail is required"})

    
    if(data.email==authorModel.email)
    return res.status(401).send({status:false, msg:"This e-mail address is already exist , Please enter valid E-mail address"})


    if(!isValid(password))
    return res.status(400).send({status:false, msg:"password is not exist"})

    let authorCreated = await authorModel.create(data)
    res.status(201).send({status:true, data : authorCreated, msg: "Author created successfully"})
}
catch(err){
    res.status(500).send({msg:"Error", error:err.message})
}
    
}

const loginAuthor = async function (req, res) {
    try{
    
    let data =req.body
    let {email,password}=data

    // let email = req.body.email;
    // let password = req.body.password;

    if(!isValidUserInput(data)){
        return res.status(400).send({status:false, msg : "Please provide login details"})
    }

    if(!isValid(email))
    return res.status(400).send({status:false, msg:"E-mail must be present"})

    if(!isValid(password))
    return res.status(400).send({status:false, msg:"password must be present"})
  
    let author = await authorModel.findOne({ email: email, password: password });

    if (!author)
      return res.status(401).send({status: false,msg: "emailID and the password is not corerct",});

let token = jwt.sign(
    {
      authorId: author._id.toString(),
    },
    "author-blog"
  );
  res.setHeader("x-api-key", token);
  res.status(200).send({ status: true, data: token, msg: "Successfully logged in" });
}
catch (err){
    res.status(500).send({ msg: "Error", error: err.message })
}
};


module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor

