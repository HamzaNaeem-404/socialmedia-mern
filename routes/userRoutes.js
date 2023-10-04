import express from "express"
import path from "path";
import { acceptRequest, changePassword, friendRequest, getFriendRequest, getUser, requestPasswordReset, resetPassword, updateUser, verifyEmail } from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";


const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.get("/verify/:userId/:token", verifyEmail);
//Paswword Reset
router.post("/request-passwordreset", requestPasswordReset); 
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/reset-password", changePassword);

//USER ROUTES
router.post("/get-user/:id?", userAuth, getUser);
router.put("/update-user", userAuth, updateUser);


//friend request
router.post("/friend-request", userAuth, friendRequest);
router.post("/get-friend-request", userAuth, getFriendRequest);

// accept / deny friend request
router.post("/accept-request", userAuth, acceptRequest);

router.get("/verified", (req, res)=>{
    res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

router.get("/resetpassword", (req, res)=>{
    res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});


export default router;