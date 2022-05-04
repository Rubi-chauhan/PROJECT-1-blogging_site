const { default: mongoose } = require('mongoose');
const authorModel = require('../models/authorModel');
const blogModel = require('../models/blogModel');

const isValidObjectId =function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) {
        return false
    }
    if (typeof value === 'string' && value.trim().length == 0) {
        return false
    }
    return true

}

const isValidUserInput = function (data) {
    return Object.keys(data).length > 0
}


const createBlog = async function (req, res) {
    try {
        let data = req.body

        let { title, body, authorId, tags, category,subcategory, isPublished } = data //extract param

        if (!isValidUserInput(data)) {
            return res.status(400).send({ status: false, msg: "Invalid request parameters. Please provide blog details" })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title is required" })
        }

        if (!isValid(body)) {
            return res.status(400).send({ status: false, msg: "Body is required" })
        }

        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, msg: "Author Id is required" })
        }


        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "Category is required" })
        }

        let author = await authorModel.findById(authorId)
        if (!author) {
            return res.status(400).send({ status: false, msg: "Author does not exist" })
        }

        const blogData ={
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }

        if(tags){
            if(Array.isArray(tags)){
                blogData['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags) === "[object String]"){
                blogData['tags'] = [tags]
            }
        }

        if(subcategory){
            if(Array.isArray(subcategory)){
                blogData['subcategory'] = [...subcategory]
            }
            if(Object.prototype.toString.call(subcategory) === "[object String]"){
                blogData['subcategory'] = [subcategory]
            }
        }

        const newBlog = await blogModel.create(blogData)
       return res.status(201).send({ status: true, msg: "New blog created successfully", data: newBlog })

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


        if (isValid(authorId) && isValidUserInput(authorId)) {
            filter["authorId"] = authorId
        }
        if (isValid(category)) {
            filter["category"] = category.trim()
        }
        if (isValid(subcategory)) {
            let arrSubcat = tags.trim().split(',').map(subcat => subcat.trim())
            filter["subcategory"] = { $all: arrSubcat }
        }
        if (isValid(tags)) {
            let arrTags = tags.trim().split(',').map(tag => tag.trim())
            filter["tags"] = { $all: arrTags }
        }


        let blogs = await blogModel.find(filter)

        if (Array.isArray(blogs) && blogs.length === 0)
            res.status(404).send({ status: false, msg: "no such document exist or it maybe deleted" })

        res.status(200).send({ status: true, msg: "Blog details accessed successfully", data: blogs, })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const updateblog = async function (req, res) {
    try{  
        let data =  req.body; 
        let blogId = req.params.blogId;
  
        let blog = await blogModel.findById(blogId)
        
        if(!blog){
        return res.status(404).send("No such blog exists");
        }
  
        if(blog.isDeleted){
        return res.status(400).send({ status: false, msg: "Blog not found, may be it is deleted" })
        }
  
  
        let updatedblog = await blogModel.findByIdAndUpdate({ _id: blogId },{...data},{new:true});
  
        res.status(201).send({ msg: "Successfully updated", data: updatedblog });
    }
    catch (err){
        res.status(500).send({ msg: "Error", error: err.message })
    }
  }




const deleteById = async function (req, res) {

try{
    let blogId  =req.params.blogId

   
    let blog = await blogModel.findOne({$and:[{_id:blogId},{isDeleted:false}]})
  
    if(!blog)
    res.status(404).send({status:false, msg: "No such blog exist or the blog is deleted"})

    if(blog.isDeleted==true)
    return res.status(404).send({status:false, msg: "No such blog exist or the blog is deleted"})

    let afterDeletion =await blogModel.findOneAndUpdate({_id:blogId},{$set:{isDeleted:true}},{new:true})
    
   return res.status(200).send({ status: true, data: afterDeletion, msg: "Blog deleted succesfully" })
}
catch(err){
    res.status(500).send({msg:"Error", error:err.message})
}

}


let deleteBlogByquery = async function (req, res) {

    try {
        let data = req.query
        let authId = req.authorId
        let { authorId, category, subcategory, tags, isPublished } = data

        let filter = { isDeleted: false, isPublished: true }

        if (!isValidObjectId(authId)) {
            return res.status(400).send({ sttaus: false, msg: `${authId} is not a valid Token Id` });
        }

        if (!isValidUserInput(data)) {
            return res.status(400).send({ status: false, msg: "No query param received. Please query details" })
        }


        if (isValid(authorId) && isValidUserInput(authorId)) {
            filter["authorId"] = authorId
        }
        if (isValid(category)) {
            filter["category"] = category.trim()
        }
        if (isValid(subcategory)) {
            let arrSubcat = tags.trim().split(',').map(subcat => subcat.trim())
            filter["subcategory"] = { $all: arrSubcat }
        }
        if (isValid(tags)) {
            let arrTags = tags.trim().split(',').map(tag => tag.trim())
            filter["tags"] = { $all: arrTags }
        }


        let blog = await blogModel.find(filter)

        if (blog.length == 0) {
            return res.status(404).send({ status: false, msg: "No such document exist or it may be deleted" })
        }



        let deletedBlog = await blogModel.updateMany({ _id: { $in: blog } }, { $set: { isDeleted: true, deletedAt: Date.now } }, { new: true })
        return res.status(200).send({ status: true, msg: "Blog deleted successfully", data: deletedBlog })

    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }


}



module.exports.getblog = getblog

module.exports.createBlog = createBlog
module.exports.updateblog = updateblog
module.exports.deleteById = deleteById
module.exports.deleteBlogByquery = deleteBlogByquery