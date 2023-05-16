const express = require("express");
const postRouter = express.Router();
const postController = require("../controllers/postController");

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

//POST ROUTES
postRouter.get("/posts", postController.getPost);
postRouter.post("/posts", postController.createPost);
postRouter.put("/posts", isAuthenticated, isAdmin, postController.putPost);
postRouter.delete(
  "/posts",
  isAuthenticated,
  isAdmin,
  postController.deleteAllPost
);
postRouter.get("/posts/:postId", postController.getSpecificPost);
postRouter.post(
  "/posts/:postId",
  isAuthenticated,
  isAdmin,
  postController.postSpecificPost
);
postRouter.patch(
  "/posts/:postId",
  isAuthenticated,
  isAdmin,
  postController.patchSpecificPost
);
postRouter.delete(
  "/posts/:postId",
  isAuthenticated,
  isAdmin,
  postController.deleteSpecificPost
);

module.exports = postRouter;
