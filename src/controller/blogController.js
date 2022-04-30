const { default: mongoose } = require('mongoose');
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



const createBlog = async function (req, res) {
    try {
        let data = req.body

        let { title, body, authorId, category } = data

        if (!isValid(title))
            return res.status(400).send({ status: false, msg: "title is not exist" })

        if (!isValid(body))
            return res.status(400).send({ status: false, msg: "body is is not exist" })

        if (!authorId)
            return res.status(400).send({ status: false, msg: "author Id is not exist" })

        if (!isValid(category))
            return res.status(400).send({ status: false, msg: "category is not exist" })

        let blogCreated = await blogModel.create(data)
        res.status(201).send({ data: blogCreated })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const getblog = async function (req, res) {

    try {

        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["x-api-key"];


        if (!token) return res.send({ status: false, msg: "token must be present" });

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

        res.status(200).send({ status: true, data: blogs })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const updateblog = async function (req, res) {
    try {
        let data = req.body;

        let blogId = req.params.blogId;

        let blog = await blogModel.findOne({_id :blogId, isDeleted: false})

        if (!blog) {
            return res.status(404).send("No such document exists");
        }

        if (blog.isDeleted) {
            return res.status(400).send({ status: false, msg: "Blog not found, may be it is deleted" })
        }



        let updatedblog = await blogModel.findByIdAndUpdate({ _id: blogId }, { $addToSet: { tags: tags, subcategory: subcategory }, $set: { title: title, body: body, publishedAt: Date.now() } }, { new: true });

        res.status(201).send({ msg: "Successfully updated", data: updatedblog });
    }
    catch (err) {
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


        let afterDeletion = await blogModel.findOneAndUpdate({ _id: blog }, { $set: { isDeleted: true } }, { new: true })

        res.status(200).send({ status: true, data: afterDeletion })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

let deleteBlogByParam = async function (req, res) {

    try {
        let data = req.query

        let blog = await blogModel.find(data).select({ authorId: 1, _id: 1 })

        if (!blog)
            res.status(404).send({ status: false, msg: "No such blog exist or the blog is deleted" })

        let deletedBlog = await blogModel.findOneAndUpdate({ _id: { $in: blog } }, { $set: { isDeleted: true } }, { new: true })
        res.status(200).send({ status: true, data: deletedBlog })

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