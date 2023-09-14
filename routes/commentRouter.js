const express = require("express");
const jwt = require("jsonwebtoken");
const commentRouter = express.Router();
const commentController = require("../controllers/commentController");
const passport = require("../passport");

const verifyUser = passport.authenticate("jwt", { session: false });

function checkTokenExpiry(req, res, next) {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.ACCESS_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is invalid or expired." });
    }

    req.user = decoded;
    next();
  });
}

//COMMENTS ROUTES
commentRouter.get("/:postId/comments", commentController.getAllComments);
commentRouter.post("/:postId/comments", verifyUser, checkTokenExpiry, commentController.postComment);
commentRouter.delete("/:postId/comments",verifyUser, checkTokenExpiry, commentController.deleteComments);
commentRouter.delete("/:postId/comments/:commentId",verifyUser, checkTokenExpiry, commentController.deleteAcomment);

//SUB-COMMENTS ROUTES
commentRouter.get("/:postId/comments/:commentId/replies", commentController.getAllReplies);
commentRouter.post("/:postId/comments/:commentId/replies", verifyUser, checkTokenExpiry, commentController.postReply);
commentRouter.get("/:postId/comments/:commentId/replies/:replyId", commentController.getReply);
//commentRouter.post("/:postId/comments/:commentId/replies/:replyId", verifyUser, checkTokenExpiry, commentController.postSubReply);

commentRouter.patch("/:postId/comments/:commentId/replies", verifyUser, checkTokenExpiry, commentController.patchSpecificReply);
commentRouter.delete("/:postId/comments/:commentId/replies", verifyUser, checkTokenExpiry, commentController.deleteAllReplies);
commentRouter.delete("/:postId/comments/:commentId/replies/:replyId", verifyUser, checkTokenExpiry, commentController.deleteReply);

module.exports = commentRouter;
