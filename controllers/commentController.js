const Post = require("../model/post");
const Comment = require("../model/comment");
const User = require("../model/user");

//GET ALL COMMENTS AND REPLIES UNDER A POST
exports.getAllComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate("comments");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await Comment.find({ postId: post._id })
      //.populate("owner replies");
      .populate([
        { path: "owner", select: "firstName" },
        { path: "replies", select: "firstName" },
        { path: "postId" },
      ]);

    return res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST A COMMENT UNDER A POST
exports.postComment = async (req, res) => {
  try {
    const { text } = req.body;
    const ownerId = req.user._id;
    const { postId } = req.params;

    const owner = await User.findById(ownerId);
    const post = await Post.findById(postId);

    //Check if the owner is authenticated to make a comment and if the post exists
    if (!owner) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    //Create a new comment
    const comment = await Comment.create({
      owner: owner._id,
      text,
      postId,
    });

    // Add the comment to the post's comments array
    post.comments.push(comment);

    // Save the post with the new comment
    await post.save();

    return res.status(201).json({ comment });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

//DELETE ALL COMMENTS UNDER A POST
exports.deleteComments = async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  const { postId } = req.params;
  const post = await Post.findById(postId);
  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can delete comments" });
    } else {
      // Check if any comment exists under the post
      if (!post || post.comments.length === 0) {
        return res
          .status(404)
          .json({ error: "No comments found for the post" });
      }

      // Delete all comments and replies under the post
      await Comment.deleteMany({ postId: postId });

      // Remove all comments references from the post
      post.comments = [];
      await post.save();

      return res.json({
        message: "All comments and replies under the post have been deleted",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE A COMMENT UNDER A POST
exports.deleteAcomment = async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);

  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const post = await Post.findById(postId);
  const comment = await Comment.findById(commentId);

  try {
    // Check if the current user is an admin or superuser
    if (currentUser.role === "superuser" && currentUser.role === "admin") {
      if (!post || !comment) {
        return res.status(404).json({ error: "Post or comment not found" });
      }

      const deleteCommentAndReplies = async (commentId) => {
        const comment = await Comment.findById(commentId);

        if (!comment) {
          return;
        }

        if (comment.replies.length > 0) {
          // Use Promise.all to delete replies in parallel
          await Promise.all(
            comment.replies.map(async (replyId) => {
              await deleteCommentAndReplies(replyId);
            })
          );
        }

        await Comment.findByIdAndDelete(commentId);
      };

      // Remove the Comment from the Post's comments array
      post.comments.pull(commentId);

      await post.save();

      return res
        .status(200)
        .json({ message: "Comment and replies deleted successfully" });
    } else {
      // Check if the comment belongs to the current user
      if (!comment.owner.equals(currentUserId)) {
        return res
          .status(403)
          .json({ error: "You can only delete your own comment" });
      }

      // Find the Post and the Comment
      if (!post || !comment) {
        return res.status(404).json({ error: "Post or comment not found" });
      }

      // Check if the comment belongs to the post
      if (!post.comments.includes(commentId)) {
        return res
          .status(400)
          .json({ error: "Comment does not belong to the post" });
      }

      // Delete the Comment and all its nested replies
      const deleteCommentAndReplies = async (commentId) => {
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

      return res
        .status(200)
        .json({ message: "Comment and replies deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
        select: "firstName",
      },
    });

    const replies = comment.replies.filter(
      (reply) => reply.postId.toString() === postId.toString()
    );

    return res.status(200).json({ replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//GET A REPLY UNDER A COMMENT UNDER A POST
exports.getReply = async (req, res) => {
  try {
    //Find a reply given by its ID from the comments array and populate the owner field
    const reply = await Comment.findById(req.params.replyId).populate({
      path: "owner",
      select: "firstName",
    });

    //Check if the reply exists
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST A REPLY UNDER A COMMENT UNDER A POST
exports.postReply = async (req, res) => {
  // Find the parent comment
  const parentComment = await Comment.findById(req.params.commentId);
  try {
    //Check if the parent comment exists
    if (!parentComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Create the new reply
    const reply = await Comment.create({
      owner: req.user._id,
      text: req.body.text,
      postId: req.params.postId,
      parentComment: parentComment._id,
    });

    // Add the reply to the parent comment's replies array and save the reply
    parentComment.replies.push(reply);
    await parentComment.save();

    // Add the reply to the Post's comments array
    const post = await Post.findById(req.params.postId);
    post.comments.push(reply);
    await post.save();

    return res
      .status(201)
      .json({ message: "Reply posted successfully", reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST REPLIES UNDER A REPLY UNDER A COMMENT UNDER A POST
exports.postSubReply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  try {
    //Search for Post and check if it exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    //Search for Comment and check if it exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    //Search for Reply and check if it exists
    const replyTo = await Comment.findById(replyId);
    if (!replyTo) {
      return res.status(404).json({ error: "Reply under Comment not found" });
    }

    //Create a new Reply object
    const reply = new Comment({
      owner: req.user.id,
      text: req.body.text,
      replies: [],
      postId: postId,
    });

    //Add and save the subReply to the reply array
    replyTo.replies.push(reply);
    await replyTo.save();

    //Add and save the reply to the comment array
    const savedReply = await reply.save();
    comment.replies.push(savedReply);
    await comment.save();

    res.status(201).json({ savedReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.patchSpecificReply = (req, res) => {
  res.statusCode = 403;
  res.end("PATCH operation not allowed");
};

//DELETE ALL REPLIES UNDER A COMMENT UNDER A POST
exports.deleteAllReplies = async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  try {
    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins and super users can delete replies" });
    } else {
      //Find the post by the given ID and check if it exists
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      //Find the comment by the given ID and check if it exists
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const replies = comment.replies;
      if (replies.length === 0) {
        return res
          .status(404)
          .json({ error: "No replies found for this comment" });
      }

      //Remove all replies from the replies array
      //replies.length = 0;
      replies.splice(0, replies.length);

      // Save the updated comment
      await comment.save();
      return res
        .status(200)
        .json({ message: "All replies under the comment have been deleted" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE A REPLY MADE BY THE USER
exports.deleteReply = async (req, res) => {
  const currentUserId = req.user._id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;

  try {
    // Use findByIdAndUpdate to delete the reply
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $pull: { replies: replyId }, // Remove the reply from the 'replies' array
      },
      { new: true } // Return the updated comment
    );

    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    // Check if the reply was deleted from the comment's replies array
    const replyIndex = updatedComment.replies.findIndex((reply) =>
      reply._id.equals(replyId)
    );

    if (replyIndex === -1) {
      return res.status(200).json({ message: 'Reply deleted successfully' });
    } else {
      return res.status(403).json({
        error: "You can only delete your own replies.",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};