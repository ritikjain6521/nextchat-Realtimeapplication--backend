import express from  "express";
import { allUser, login, logout, Signup } from "../controller/user.controller.js";
import secureRoute from "../middieware/Secureroute.js";

const router= express.Router()
router.post("/signup",Signup)
router.post("/login",login)
router.post("/logout",logout)
router.get("/alluser",secureRoute,allUser)
export default router;