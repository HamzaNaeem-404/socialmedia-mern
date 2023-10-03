import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import { compareString } from "../utils/index.js";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const verificationRecord = await Verification.findOne({ userId });
    
    if (!verificationRecord) {
      const message = "Invalid Verification link. abey yar record hi ni mila Try again later.";
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



// export const verifyEmail = async (req, res) => {
//   const { userId, token } = req.params;

//   try {
//     const result = await Verification.findOne({ userId });

//     if (result) {
//       const { expiresAt, token: hashedToken } = result;

//       if (expiresAt < Date.now()) {
//         VerificationModel.findOneAndDelete({ userId })
//           .then(() => {
//             Users.findOneAndDelete({ _id: userId })
//               .then(() => {
//                 const message = "Verification Token has Expired.";
//                 res.redirect(`/users/verified?status=error&message=${message}`);
//               })
//               .catch((err) => {
//                 //_________
//                 res.redirect(`/users/verified?status=error&message=`);
//               });
//           })
//           .catch((error) => {
//             console.log(error);
//             res.redirect(`/users/verified?message=`);
//           });
//       } else {
//         //token Valid
//         compareString(token, hashedToken)
//           .then((isMatch) => {
//             if (isMatch) {
//               Users.findOneAndUpdate({ _id: userId }, { verified: true })
//                 .then(() => {
//                   VerificationModel.findOneAndDelete({ userId })
//                     .then(() => {
//                       const message = "Email Verified Successfully";
//                       res.redirect(
//                         `/users/verified?status=success&message=${message}`
//                       );
//                     })
//                     .catch((err) => {
//                       console.log(err);
//                       const message = "Verification failed or link is invalid";
//                       res.redirect(
//                         `/users/verified?status=error&message=${message}`
//                       );
//                     });
//                 })
//                 .catch((err) => {
//                   console.log(err);
//                   const message = "Verification failed or link is invalid";
//                   res.redirect(
//                     `/users/verified?status=error&message=${message}`
//                   );
//                 });
//             } else {
//               //invalid Token
//               const message = "Verification failed or link is invalid";
//               res.redirect(`/users/verified?status=error&message=${message}`);
//             }
//           })
//           .catch((err) => {
//             console.log(err);
//             res.redirect(`/users/verified?message=`);
//           });
//       }
//     } else {
//       //1:12 check this route
//       const message = "Invalid Verification Link.try gain later ";
//       res.redirect(`/users/verified?status=error&message=${message}`);
//     }
//   } catch (error) {
//     console.log(error);
//     res.redirect(`/users/verified?message=`);
//   }
// };
