const express = require("express");
const gradePointRouter = express.Router();
const gradePointController = require("../controllers/gradePointController");

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

gradePointRouter.get("/grade-points", gradePointController.getGradePoint);
gradePointRouter.post("/grade-points", isAuthenticated, gradePointController.postGradePoint);
gradePointRouter.put("/grade-points/:gradeId", gradePointController.updateGradePoint);
gradePointRouter.delete("/grade-points/:gradeId", gradePointController.deleteGradePoint);

module.exports = gradePointRouter;