import express from "express";
import * as userController from "./../controllers/user.controller";
import * as authController from "./../controllers/auth.controller";

const router = express.Router();

router
  .route("/:id")
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);

export default router;
