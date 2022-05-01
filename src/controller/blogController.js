const { default: mongoose } = require('mongoose');
const authorModel = require('../models/authorModel');
const blogModel = require('../models/blogModel');

// const isValidObjectId =function(Id){
//     return mongoose.Types.ObjectId.isValid(Id)
// }

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) {
        return false
    }
    if (typeof value === 'string' && value.trim().length == 0) {
        return false
    }
    return true

}

const isValidUserInput = function(data){
    return Object.keys(data).length>0
}



const createBlog = async function (req, res) {
    try {
        let data = req.body

        let { title, body, authorId, category } = data

        if(!isValidUserInput(data)){
        return res.status(400).send({ status: false, msg: "Please provide blog details" })
        }

        if (!isValid(title)){
            return res.status(400).send({ status: false, msg: "Title is required" })
        }

        if (!isValid(body)){
            return res.status(400).send({ status: false, msg: "Body is required" })
        }

        if (!isValid(authorId)){
            return res.status(400).send({ status: false, msg: "Author Id is required" })
        }

        if (!isValid(category)){
            return res.status(400).send({ status: false, msg: "Category is required" })
        }
        
        let author = await authorModel.findById(data.authorId)
        if(!author){
        return res.status(400).send({ status: false, msg: "No such document found" })
        }


        let blogCreated = await blogModel.create(data)
        res.status(201).send({ status : true, data: blogCreated , msg: "Blog created successfully" })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const getblog = async function (req, res) {

    try {


        let data = req.query
        let { authorId, category, subcategory, tags } = data

        let filter = { isDeleted: false, isPublished: true }
        if (authorId) {
            filter["authorId"] = authorId
        }
        if (category) {
            filter["category"] = category
        }
        if (subcategory) {
            filter["subcategory"] = subcategory
        }
        if (tags) {
            filter["tags"] = tags
        }

        let blogs = await blogModel.find(filter)

        if (blogs.length == 0)
            res.status(404).send({ status: false, msg: "no such document exist or it may be deleted" })

        res.status(200).send({ status: true, msg: "Blog details accessed successfully", data: blogs,  })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const updateblog = async function (req, res) {
    try{  
        let data =  req.body; 
        let blogId = req.params.blogId;
        const tags = req.body.tags;
        const subcategory = req.body.subcategory;
        const title = req.body.title;
        const body = req.body.body;
  
        let blog = await blogModel.findById(blogId)
        
        if(!blog){
        return res.status(404).send({sttaus: false, msg: "No such blog exists"});
        }
  
        if(blog.isDeleted == true){
        return res.status(400).send({ status: false, msg: "Blog not found, may be it is deleted" })
        }
  
    
  
        let updatedblog = await blogModel.findByIdAndUpdate({ _id: blogId },{ $addToSet :{tags : tags, subcategory : subcategory} , $set : {title : title , body : body, publishedAt: Date.now()}},{new:true});
  
        res.status(201).send({ status : true, data: updatedblog, msg: "Blog successfully updated" });
    }
    catch (err){
        res.status(500).send({ msg: "Error", error: err.message })
    }
  }



const deleteById = async function (req, res) {

    try {
        let blogId = req.params.blogId


        let blog = await blogModel.findOne({ $and: [{ _id: blogId }, { isDeleted: false }] })

        if (!blog)
            res.status(404).send({ status: false, msg: "No such blog exist or the blog is deleted" })

        if (blog.isDeleted == true)
            return res.status(404).send({ status: false, msg: "No such blog exist or the blog is deleted" })


        let afterDeletion = await blogModel.findOneAndUpdate({ _id: blog }, { $set: { isDeleted: true , delatedAt: Date.now} }, { new: true })

        res.status(200).send({ status: true, data: afterDeletion, msg: "Blog deleted succesfully" })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

let deleteBlogByParam = async function (req, res) {

    try {
        let data = req.query
        let { authorId, category, subcategory, tags, isPublished } = data

        if (Object.keys(data).length==0){
            res.status(404).send({ status: false, msg: "Please provide query details " })
        }

        let filter = { isDeleted: false, isPublished: true }
        if (authorId) {
            filter["authorId"] = authorId
        }
        if (category) {
            filter["category"] = category
        }
        if (subcategory) {
            filter["subcategory"] = subcategory
        }
        if (tags) {
            filter["tags"] = tags
        }
        if (isPublished) {
            filter["isPublished"] = true
        }

        let blogs = await blogModel.find(filter)

        if (blogs.length == 0)
            res.status(404).send({ status: false, msg: "No such blog exist " })


        let blog = await blogModel.find(data).select({ authorId: 1, _id: 1 })

        if (!blog)
            res.status(404).send({ status: false, msg: "No such document exist " })

        if(blog.isDeleted==true)
        res.status(404).send({ status: false, msg: "No such blog exist or may be the blog is deleted" })


        let deletedBlog = await blogModel.findOneAndUpdate({ _id: { $in: blog } }, { $set: { isDeleted: true } }, { new: true })
        res.status(200).send({ status: true,msg: "Blog deleted successfully" ,data: deletedBlog })

    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }


}



module.exports.getblog = getblog

module.exports.createBlog = createBlog
module.exports.updateblog = updateblog
module.exports.deleteById = deleteById
module.exports.deleteBlogByParam = deleteBlogByParam