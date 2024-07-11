import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import sendError from './assets/error.controller';

export interface IGetUserAuthInfoRequest extends Request {
    user: string // or any other type
  }
declare const process : {
    env: {
      NODE_ENV: string,
      JWT_EXPIRES_IN: string,
      JWT_SECRET: string,
      JWT_COOKIE_EXPIRES_IN: string,
      VERIFY_EXPIRE_TIME: string,
    }
}

// ---------------------------- Utils -----------------------------

const signToken = (id: number | string) => {
    return jwt.sign({id,
      exp: Math.floor(Date.now() / 1000) + parseFloat(process.env.JWT_EXPIRES_IN) * 3600
    }, process.env.JWT_SECRET);
};

export const createSendToken = (user: any, statusCode: number, res: Response) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + parseFloat(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 60 * 1000
        ),
        secure: process.env.NODE_ENV === 'production' ? true: false,
        httpOnly: true
    };

    //remove password from output
    user.email = user.email;
    user.password = undefined;
    user.passwordConfirm = undefined;
    
    res.status(statusCode).cookie('jwt', token, cookieOptions).json({
        status: 'success',
        token,
        user
    });
};

const correctPassword = async (candidatePassword: string, userPassword: string) => {
    return await bcrypt.compare(candidatePassword, userPassword);
}

const changedPasswordAfter = (passwordChangedAt: Date | undefined | null, JWTTimestamp: number | undefined) => {
    if (passwordChangedAt && JWTTimestamp) {
        const changedTimestamp = new Date(passwordChangedAt).getTime() / 1000;
        return changedTimestamp > JWTTimestamp;
    }
    return false;
}


// ---------------------------------------------------------------

export const signUp = async (req: Request, res: Response) => {
    
    try {
        
        // Get the user data from body
        const data = req.body;
        const newUser = await User.create(data);
        
        createSendToken(newUser, 200, res);
    } catch (err: any) {
        sendError(err, 400, req, res);
    }
};

export const signIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1) check if email and password exist
        if (!email || !password) {
            return sendError({message: 'Please provide email and password'}, 400, req, res);
        }
        // 2) check if user exists and password is correct
        const user: any = await User.findOne({email}).select('+password');

        if (!user) {
            return sendError({message: 'No user found with this email'}, 404, req, res );
        } else {
            const correct = await correctPassword(password, user.password);
            if (!correct) {
                return sendError({message: 'Incorrect password'}, 400, req, res);
            }
        }

        // 3) check if user account was blocked
        // 4) if everything is ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        sendError(err, 404, req, res);
    }
}


export const signOut = (req: Request, res: Response) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000), //expires after 10 seconds
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1) Get token
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedOut') {
            token = req.cookies.jwt;
        }

        if (!token) {
            return sendError({message: {logStatus: 'You are logged out. Please log in'}}, 401, req, res);
        }

        // 2) Verify token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(
                sendError({message: {token: 'The user belonging to this token does not exist'}}, 401, req, res)
            );
        }

        // 4) Check if user changed password after the token was issued
        if (changedPasswordAfter(currentUser.passwordChangedAt, decoded.iat)) {
            return next(
                sendError({message: {password: 'User recently changed password! Please log in again'}}, 401, req, res)
            );
        }

        // Grant access to protected routes
        // req.user = currentUser;
        next()
        
    } catch(err) {
        sendError(err, 400, req, res);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on Posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return sendError({message: 'There is no user with this email'}, 404, req, res)
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();

    // 3) Send the token to user's email
    try {
        const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
        const message = `Forgot your password? Please click this url to reset your password: ${resetUrl} \n
        If you didn't forget your password, please ignore this email`;
        // await sendEmail(user.email, 'Password Reset', message);
        res.status(200).json({
            status: 'success',
            subject: 'Token sent to email',
            message,
            resetToken
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return sendError({message: 'There was an error. Try again later'}, 500, req, res)
        
    }
}; 

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const user: any = await User.findOne({ email: data.email });
        user.password = data.password;
        user.passwordConfirm = data.passwordConfirm;

        user.passwordCreatedAt = new Date();
        await user.save();
        createSendToken(user, 200, res);
    } catch(err) {
        sendError(err, 400, req, res);
    }
}
