import Users from '../models/userModel.js';
import { hashString } from '../utils/index.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';

export const register = async (req, res, next)=>{
    const{firstName, lastName, email, password} = req.body;

    if(!(firstName || lastName || email || password)){
        next("Provide Required Fields!");
        return;
    }

    try{
        const userExist = await Users.findOne({email});

        if(userExist){
            next("Email address already exists");
            return;
        }

        const hashedPassword = await hashString(password);

        const user = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        //send email verification to user
        sendVerificationEmail(user, res);

    }catch(error){
        console.log(error);
        res.status(404).json({message: error.message});
    }
}


