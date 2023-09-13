const Post = require("../model/post");
const User = require("../model/user");
const Comment = require("../model/comment");
const NodeCache = require( "node-cache" );
const cache = new NodeCache({ stdTTL: 60 * 5 });

//GET ALL POSTS WITH ITS COMMENTS
exports.getPosts = async (req, res) => {
  try {
    //Get all posts and populate it with the comments without the replies
    const posts = await Post.find().populate({
      path: "comments",
    });

    return res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//CREATE A NEW POST
exports.createPost = async (req, res) => {
  const { title, description, excerpt, slug, photo, type } = req.body;
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);

  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can make posts" });
    } else {
      //Create a new post
      const post = await Post.create({
        title,
        description,
        excerpt,
        slug,
        photo,
        type,
        admin: currentUserId,
      });

      return res.status(201).json({ post });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.putAllPosts = async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can delete posts" });
    } else {
      res.statusCode = 403;
      res.end("Put Operation Not Supported");
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//DELETE ALL POSTS
exports.deleteAllPost = async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can delete posts" });
    } else {
      const post = await Post.deleteMany();

      //Check if the any post exists
      if (!post) {
        return res.status(404).json({ error: "No post found" });
      }
      return res
        .status(200)
        .json({ message: "All posts deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

//ROUTES FOR SPECIFIC POST
//GET A POST WITH ITS COMMENTS
exports.getSpecificPost = async (req, res) => {
  const { postId } = req.params;
  try {
    // Check if the data is already cached
    const cacheKey = "posts";
    const isCached = cache.has(cacheKey);

    if (isCached) {
      const cachedData = cache.get(cacheKey);
      return res.status(200).json(cachedData);
    }

    //Find the specific post with the given ID from the params then populate the comment and the owner fields
    const post = await Post.find({ slug: postId })
      .populate({
        path: "comments",
        populate: { path: "owner", select: "firstName" },
      })
      .exec();

    //Check if the post exists
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    cache.set(cacheKey, post);
    return res.status(200).json({ post });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.postSpecificPost = async (req, res, next) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can delete posts" });
    } else {
      res.statusCode = 403;
      res.end("Post operation not supported");
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//UPDATE A POST
exports.patchSpecificPost = async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  const post = await Post.findById(req.params.postId);
  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can delete posts" });
    } else {
      if (!post) {
        return res.status(404).json({ error: "post does not exist" });
      }

      const updates = Object.keys(req.body);

      //Specify the allowed updates which will be in the post body
      const allowedUpdates = [
        "title",
        "description",
        "excerpt",
        "type",
        "slug",
        "photo",
        "admin",
      ];

      //Function for validating allowed updates
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        return res.status(400).json({ error: "Invalid update fields!" });
      }

      updates.forEach((update) => (post[update] = req.body[update]));

      await post.save();
      return res.status(200).json({ post });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//DELETE A POST WITH ITS COMMENTS
exports.deleteSpecificPost = async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can delete posts" });
    } else {
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
      return res.status(200).json({
        message:
          "Post and associated comments and replies have been deleted successfully",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
