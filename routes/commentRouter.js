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

const checkActiveStatus = async (req, res, next) => {
  const { user } = req;

  // Check if the user is not active
  if (user && !user.isActive) {
    return res.status(403).json({ error: "User deactivated. Contact admin for more support" });
  }

  // If the user is active, proceed to the next middleware
  next();
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
// commentRouter.post(
//   "/:postId/comments/:commentId/replies/:replyId",
//   isAuthenticated,
//   commentController.postSubReply
// );
commentRouter.patch(
  "/:postId/comments/:commentId/replies",
  isAuthenticated,
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
  commentController.deleteReply
);

module.exports = commentRouter;
