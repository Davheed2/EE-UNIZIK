const express = require("express");
const postRouter = express.Router();
const jwt = require("jsonwebtoken");
const postController = require("../controllers/postController");
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


postRouter.get("/posts", postController.getPosts);
postRouter.post("/posts", verifyUser, checkTokenExpiry, postController.createPost);
postRouter.put("/posts", verifyUser, checkTokenExpiry, postController.putAllPosts);
postRouter.delete("/posts", verifyUser, checkTokenExpiry, postController.deleteAllPost);

postRouter.get("/posts/:postId", postController.getSpecificPost);
postRouter.post("/posts/:postId", verifyUser, checkTokenExpiry, postController.postSpecificPost);
postRouter.patch("/posts/:postId", verifyUser, checkTokenExpiry, postController.patchSpecificPost);
postRouter.delete("/posts/:postId", verifyUser, checkTokenExpiry, postController.deleteSpecificPost);

module.exports = postRouter;
