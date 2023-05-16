const Post = require("../model/post");
const Comment = require("../model/comment");
const User = require("../model/user");


//GET ALL COMMENTS AND REPLIES UNDER A POST
exports.getAllComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("comments");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comments = await Comment.find({ postId: post._id })
    //.populate("owner replies");
    .populate([
      {path: "owner", select: "firstName"},
      {path: "replies", select: "firstName"},
      {path: "postId"}
    ])

    res.json({comments});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

//POST A COMMENT UNDER A POST
exports.postComment = async (req, res) => {
  try {
    const {text} = req.body;
    const ownerId = req.user._id;
    const postId = req.params.postId;

    const owner = await User.findById(ownerId);
    const post = await Post.findById(postId);

    //Check if the owner is authenticated to make a comment and if the post exists
    if (!owner) {
      return res.status(404).send({ message: "User not found" });
    }
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    //Create a new comment
    const comment = new Comment({ 
      owner: owner._id, 
      text, 
      postId 
    });
    
    // Save the comment
    await comment.save();

    // Add the comment to the post's comments array
    post.comments.push(comment);

    // Save the post with the new comment
    await post.save();

    res.status(201).json({comment});
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error"});
  }
}

exports.patchAllComment = (req, res) => {
  res.statusCode = 403;
  res.end("PATCH operation not allowed on " + req.params.id + "/comments");
}

//DELETE ALL COMMENTS UNDER A POST
exports.deleteComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if any comment exists under the post
    const post = await Post.findById(postId);
    if (!post || post.comments.length === 0) {
      return res.status(404).json({ message: "No comments found for the post" });
    }

    // Delete all comments and replies under the post
    await Comment.deleteMany({ postId: postId });

    // Remove all comments references from the post
    post.comments = [];
    await post.save();

    res.json({ message: "All comments and replies under the post have been deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

//DELETE A COMMENT UNDER A POST
exports.deleteAcomment = async (req, res) => {
  try { 
    const postId = req.params.postId; 
    const commentId = req.params.commentId;

    // Find the Post and the Comment 
    const post = await Post.findById(postId); 
    const comment = await Comment.findById(commentId); 
    if (!post || !comment) { 
      return res.status(404).json({ message: "Post or comment not found" }); 
    } 
    
    // Check if the comment belongs to the post 
    if (!post.comments.includes(commentId)) { 
      return res .status(400) .json({ message: "Comment does not belong to the post" }); 
    } 
    
    // Delete the Comment and all its nested replies 
    const deleteCommentAndReplies = async (commentId) => { 
      const comment = await Comment.findById(commentId); 
      if (comment.replies.length > 0) { 
        for (let replyId of comment.replies) { 
          await deleteCommentAndReplies(replyId); 
        } 
      } 
      await Comment.findByIdAndDelete(commentId); 
    }; 
    await deleteCommentAndReplies(commentId); 
    // Remove the Comment from the Post's comments array 
    post.comments.pull(commentId); 
    await post.save(); 
    return res.json({ message: "Comment and replies deleted successfully" }); 
  } catch (error) { 
    console.error(error); 
    return res.status(500).json({ message: "Server Error" }); 
  }
}
    
    
    
    
//////////////////////////////SUB-COMMENTS ROUTES////////////////////////
//GET ALL REPLIES UNDER A COMMENT UNDER A POST
exports.getAllReplies = async (req, res) => {  
  try {
    const { postId, commentId } = req.params;
    //Get all the replies under a specified comment by its ID and populate the owner field
    const comment = await Comment.findById(commentId).populate({
      path: "replies",
      populate: {
        path: "owner",
        select: "firstName"
      }
    });

    const replies = comment.replies.filter(reply => reply.postId.toString() === postId.toString());
    res.json({replies});
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }    
}

//GET A REPLY UNDER A COMMENT UNDER A POST
exports.getReply = async (req, res) => {
  try {
    //Find a reply given by its ID from the comments array and populate the owner field
    const reply = await Comment.findById(req.params.replyId).populate({
      path: "owner",
      select: "firstName"
    });

    //Check if the reply exists
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }
    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

//POST A REPLY UNDER A COMMENT UNDER A POST
exports.postReply = async (req, res) => {
  try {
    // Find the parent comment
    const parentComment = await Comment.findById(req.params.commentId);

    //Check if the parent comment exists
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Create the new reply
    const reply = new Comment({
      owner: req.user._id, // assuming you're using authentication and have the current user's ID in req.user._id
      text: req.body.text,
      postId: req.params.postId,
      parentComment: parentComment._id
    });

    // Save the reply
    await reply.save();

    // Add the reply to the parent comment's replies array and save the reply
    parentComment.replies.push(reply);
    //parentComment.replies.push(reply._id);
    await parentComment.save();

    // Add the reply to the Post's comments array
    const post = await Post.findById(req.params.postId);
    post.comments.push(reply);
    //post.comments.push(reply._id);
    await post.save();

    res.status(201).json({ message: "Reply posted successfully", reply });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Server error", err });
  }
}

//POST REPLIES UNDER A REPLY UNDER A COMMENT UNDER A POST
exports.postSubReply = async (req, res) => {
  try {
    const {postId, commentId, replyId} = req.params;

    //Search for Post and check if it exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ err: "Post not found"});
    }

    //Search for Comment and check if it exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ err: "Comment not found"});
    }

    //Search for Reply and check if it exists
    const replyTo = await Comment.findById(replyId);
    if (!replyTo) {
      return res.status(404).json({ err: "Reply under Comment not found"});
    }

    //Create a new Reply object
    const reply = new Comment({
      owner: req.user.id,
      text: req.body.text,
      replies: [],
      postId: postId
    });

    //Add and save the subReply to the reply array
    replyTo.replies.push(reply);
    await replyTo.save();
    
    //Add and save the reply to the comment array
    const savedReply = await reply.save();
    comment.replies.push(savedReply);
    await comment.save();

    res.json({savedReply});
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Server error"});
  }
}
    
exports.patchSpecificReply = (req, res) => {
  res.statusCode = 403;
  res.end("PATCH operation not allowed");
}
    
//DELETE ALL REPLIES UNDER A COMMENT UNDER A POST
exports.deleteAllReplies = async (req, res) => {
  try {
    //Find the post by the given ID and check if it exists
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    //Find the comment by the given ID and check if it exists
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    const replies = comment.replies;
    if (replies.length === 0) {
      return res.status(404).send("No replies found for this comment");
    }

    // Remove all replies from the replies array
    //replies.length = 0;
    replies.splice(0, replies.length);

    // Save the updated comment
    await comment.save();
    res.send("All replies under the comment have been deleted");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }              
}

//DELETE A REPLY UNDER A COMMENT UNDER A POST
exports.deleteReply = async (req, res) => {
  try {
    //Find the comment and post by its given ID, then remove the reply with the given ID from the Comment reply array
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, postId: req.params.postId },
      { $pull: { replies: req.params.replyId } },
      { new: true }
    );

    //Check if the comment exists
    if (!comment) {
      return res.status(404).send({ error: "Comment not found." });
    }

    res.status(200).json({ message: "Reply deleted successfully", comment});
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Server error." });
  }
}