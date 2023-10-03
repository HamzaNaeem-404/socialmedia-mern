// import mongoose, {Schema} from "mongoose";

// const emailVerificationSchema = new mongoose.Schema(
//     {
//         userId: String,
//         token: String,
//         createdAt: Date,
//         expiresAt: Date,
//     },
// );

// const Verification = mongoose.model("Verification", emailVerificationSchema);
// export default Verification;

import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  userId: String,
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: function () {
      // Set the expiration time to 1 hour from createdAt
      const oneHourLater = new Date(this.createdAt);
      oneHourLater.setHours(this.createdAt.getHours() + 1);
      return oneHourLater;
    },
    index: { expires: "1h" }, // This sets the expiration index to 1 hour
  },
});

const Verification = mongoose.model("Verification", emailVerificationSchema);
export default Verification;
