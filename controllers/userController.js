import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const verificationRecord = await Verification.findOne({ userId });
    
    if (!verificationRecord) {
      const message = "Invalid Verification link. No record found. Try again later.";
      console.log("Token:", token); // Log the value of 'token'
      return res.redirect(`/users/verified?status=error&message=${message}`);
    }
    
    
    const { expiresAt, token: hashedToken } = verificationRecord;
    console.log("Token:", token); // Log the value of 'token'
    console.log("Hashed Token:", hashedToken); // Log the value of 'hashedToken'

    if (expiresAt < Date.now()) {
      console.log("Token has expired");
      await Promise.all([
        Verification.findOneAndDelete({ userId }),
        Users.findOneAndDelete({ _id: userId }),
      ])
        .then(() => {
          const message = "Verification token has expired.";
          res.redirect(`/users/verified?status=error&message=${message}`);
        })
        .catch((error) => {
          console.error(error);
          const message = "An error occurred during verification.";
          res.redirect(`/users/verified?status=error&message=${message}`);
        });
    } else {
      // Token is valid, compare it with hashedToken
      const isTokenValid = await compareString(token, hashedToken);

      console.log("User Password:", token); // Log the value of 'userPassword' (same as 'token')
      console.log("Hashed Token:", hashedToken); // Log the value of 'hashedToken' again

      if (isTokenValid) {
        await Users.findOneAndUpdate({ _id: userId }, { verified: true });

        await Verification.findOneAndDelete({ userId });

        const message = "Email verified successfully.";
        res.redirect(`/users/verified?status=success&message=${message}`);
      } else {
        // Invalid token
        console.log("Invalid token");
        const message = "Verification failed or link is invalid.";
        console.log("Token:", token); // Log the value of 'token'
        console.log("Hashed Token:", hashedToken); // Log the value of 'hashedToken'
        res.redirect(`/users/verified?status=error&message=${message}`);
      }
    }
  } catch (error) {
    console.error(error);
    const message = "An error occurred during verification.";
     res.redirect(`/users/verified?status=error&message=${message}`);
  }
};

export const requestPasswordReset = async (req, res)=>{
  try{
    const {email} = req.body;
    const user = await Users.findOne({email});
    if(!user){
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }
      const existingRequest = await PasswordReset.findOne({email});
      if(existingRequest){
        if(existingRequest.expiresAt > Date.now()){
          return res.status(201).json({
            status: "PENDING",
            message: "Reset password link has already been sent to your email",
          });
        }
        await PasswordReset.findOneAndDelete({email});
      }
        await resetPasswordLink(user, res);

  } catch(error){
    console.log(error);
    res.status(404).json({message: error.message});
  }
};

export const resetPassword = async (req, res)=>{
  const {userId, token} = req.params;

  try{
      //find record
      const user = await Users.findById(userId);

      if(!user){
        const message = "Invalid password reset link. Try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      }

      const resetPassword = await PasswordReset.findOne({userId});
      if(!resetPassword){
        const message = "Invalid password reset link. Try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      }

      const {expiresAt, token: resetToken } = resetPassword;

      if(expiresAt < Date.now ()){
        const message = "Reset Password link has expired. Please try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      }
      else{
        const isMatch = await compareString(token, resetToken);

        if(!isMatch){
          const message = "Invalid reset password link. Please try again";
          res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }
        else{
          res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
        }
      }
  }
  catch(error){
    console.log(error);
    res.status(404).json({message: error.message});
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const hashedpassword = await hashString(password);
    const user = await Users.findByIdAndUpdate(
      { _id: userId },
      { password: hashedpassword }
    );
    if (user) {
      await PasswordReset.findOneAndDelete({ userId });
      res.status(200).json({ok:true})
      // const message = "Password has been successfully reset";
      // res.redirect(`/users/resetpassword?status=success&message=${message}`);
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUser = async (req, res, next)=>{
  try{
    const {userId} = req.body.user;
    const {id} = req.params;

     const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
     });
     
     if(!user){
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
     }

     user.password = undefined;
     res.status(200).json({
      success: true,
      user: user,
     });
  }
  catch(error){
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message
    });
  }
};

export const updateUser = async (req, res, next) =>{
  try{
    const {firstName, lastName, location, profileUrl, profession}= req.body;

    if(!(firstName || lastName || location || contact || profession))
    {
      next("Please provide all required fields");
      return;
    }
      const {userId} = req.body.user;

      const updateUser = {
        firstName,
        lastName,
        location,
        profileUrl,
        profession,
        _id: userId,
      };

      const user = await Users.findByIdAndUpdate(userId, updateUser, {
        new: true,
      });

        await user.populate({path: "friends", select: "-password"});
        const token = createJWT(user?._id);

        user.password = undefined;

        res.status(200).json({
          success: true,
          message: "User updated successfully",
          user,
          token
        });
  }
  catch(error){
    console.log(error);
    res.status(404).json({ message: error.message});
  }
};

export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { requestTo } = req.body;

    const requestExist = await FriendRequest.findOne({
      reqestForm: userId,
      requestTo,
    });

    if (requestExist) {
      next("Friend request Already Sent");
      return;
    }

    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (accountExist) {
      next("Friend Request Already Sent ");
      return;
    }

    const newRes = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
    });

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileUrl profession -password",
      })
      .limit(10)
      .sort({
        _id: -1,
      });

      console.log(request);

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId;
    const { rid, status } = req.body;
    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next("No friend Request Found");
      return;
    }

    const newRes = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status }
    );

    if (status === "Accepted") {
      const user = await Users.findById(id);
      user.friends.push(newRes?.requestFrom);

      await user.save();
      const friend = await Users.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestId);
      await friend.save();
    }

    res.status(201).json({
      success: true,
      message: "Friend Request" + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const profileViews = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.body;
    const user = await Users.findById(id);
    user.views.push(userId);
    await user.save();
    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const suggestedFriends = async (req, res) => {
  try {
    const { userId } = req.body.user;

    let queryObject = {};
    //not equal _> not fetch my records
    queryObject._id = { $ne: userId };
    //not in our friends either
    queryObject.friends = { $nin: userId };

    let queryResult = Users.find(queryObject)
      .limit(15)
      .select("firstName lastName profileUrl profession -password");

    const suggestedFriends = await queryResult;

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.log(error);
  }
};
