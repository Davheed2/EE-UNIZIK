const Post = require("../model/post");
const Comment = require("../model/comment");

////////////////////////////////POST SECTIONS////////////////////////////////
//GET ALL POSTS WITH ITS COMMENTS
exports.getPost = async (req, res) => {
  try {
    //Get all posts and populate it with the comments and not replies
    const posts = await Post.find().populate({
      path: "comments"
    });
    res.json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//CREATE A NEW POST
exports.createPost = async (req, res) => {
  try {
    //Create a new post
    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      //   excerpt: req.body.excerpt,
      //   slug: req.body.slug,
      //   photo: req.body.photo,
      admin: req.user._id,
    });

    //await and save the new post
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.putPost = (req, res) => {
  res.statusCode = 403;
  res.end("Put Operation Not Supported");
};

//DELETE ALL POSTS
exports.deleteAllPost = async (req, res) => {
  try {
    const post = await Post.deleteMany();

    //Check if the any post exists
    if (!post) {
      return res.status(404).send("No post found");
    }
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
};

//ROUTES FOR SPECIFIC POST
//GET A POST WITH ITS COMMENTS
exports.getSpecificPost = async (req, res) => {
  const { postId } = req.params;
  try {
    //Find the specific post with the given ID from the params then populate the comment and the owner fields
    //const post = await Post.find({slug:postId})
    const post = await Post.findById(postId)
      .populate({
        path: "comments",
        populate: { path: "owner", select: "firstName" },
      })
      .exec();

    //Check if the post exists
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.send({ post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.postSpecificPost = (req, res, next) => {
  res.statusCode = 403;
  res.end("Post operation not supported");
};

//UPDATE A POST
exports.patchSpecificPost = async (req, res) => {
  const updates = Object.keys(req.body);
  //Specify the allowed updates which will be in the post body
  const allowedUpdates = ["title", "description", "photo", "admin"];
  //Function for validating allowed updates
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid update fields!" });
  }

  try {
    //Find the post by its ID
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send("post does not exist");
    }

    updates.forEach((update) => (post[update] = req.body[update]));
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
};

//DELETE A POST WITH ITS COMMENTS
exports.deleteSpecificPost = async (req, res) => {
  try {
    // Find the post by ID and populate its comments
    const post = await Post.findById(req.params.postId).populate("comments");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Delete all the comments and their replies associated with the post
    for (const comment of post.comments) {
      await Comment.deleteMany({ _id: comment._id });
    }

    // Delete the post
    await Post.deleteOne({ _id: req.params.postId });

    // Send a success response
    res
      .status(200)
      .send({
        message:
          "Post and associated comments and replies have been deleted successfully",
      });
  } catch (error) {
    // Send an error response if something goes wrong
    console.log(error);
    res
      .status(500)
      .send({
        message:
          "An error occurred while deleting the post and associated comments and replies",
      });
  }
};
