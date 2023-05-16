const express = require("express");
const commentRouter = express.Router();
const commentController = require("../controllers/commentController");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};

const isAdmin = (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.role.includes("admin")) ||
    req.user.role.includes("superuser")
  ) {
    return next();
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }
};

//COMMENTS ROUTES
commentRouter.get(
  "/:postId/comments",
  isAuthenticated,
  commentController.getAllComments
);
commentRouter.post(
  "/:postId/comments",
  isAuthenticated,
  commentController.postComment
);
commentRouter.patch(
  "/:postId/comments",
  isAuthenticated,
  isAdmin,
  commentController.patchAllComment
);
commentRouter.delete(
  "/:postId/comments",
  isAuthenticated,
  isAdmin,
  commentController.deleteComments
);
commentRouter.delete(
  "/:postId/comments/:commentId",
  isAuthenticated,
  isAdmin,
  commentController.deleteAcomment
);

commentRouter.get(
  "/:postId/comments/:commentId/replies",
  isAuthenticated,
  commentController.getAllReplies
);
commentRouter.get(
  "/:postId/comments/:commentId/replies/:replyId",
  isAuthenticated,
  commentController.getReply
);
commentRouter.post(
  "/:postId/comments/:commentId/replies",
  isAuthenticated,
  commentController.postReply
);
commentRouter.post(
  "/:postId/comments/:commentId/replies/:replyId",
  isAuthenticated,
  commentController.postSubReply
);
commentRouter.patch(
  "/:postId/comments/:commentId/replies",
  isAuthenticated,
  isAdmin,
  commentController.patchSpecificReply
);
commentRouter.delete(
  "/:postId/comments/:commentId/replies",
  isAuthenticated,
  isAdmin,
  commentController.deleteAllReplies
);
commentRouter.delete(
  "/:postId/comments/:commentId/replies/:replyId",
  isAuthenticated,
  isAdmin,
  commentController.deleteReply
);

module.exports = commentRouter;
