import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as factory from './assets/crud.controller';
import User from './../models/user.model';
import sendError from './assets/error.controller';

export const getMyId = (req:Request) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedOut') {
    token = req.cookies.jwt;
  }

  // 2) Verify token
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  return decoded.id
}

// middleware to insert userId to request body
export const setUserIdtoBody = (req: Request, res: Response, next: NextFunction) => {
  const userId = getMyId(req);
  req.body.userId = userId;
  next()
};

export const setUserIdtoQuery = (req: Request, res: Response, next: NextFunction) => {
  const userId = getMyId(req);
  req.query.userId = userId;
  next()
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const id = getMyId(req);
    
    // 3) Check if user still exists
    const personalInformation = await User.findById(id);
    res.status(200).json({
      status: 'success',
      personalInformation
    });

  } catch (error) {
    sendError(error, 400, req, res)
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Create error if user Posts password data
    if(req.body.password || req.body.passwordConfirm) {
      return next(
        sendError({message: 'This route is not for password updates. Please use /updateMyPassword'}, 400, req, res)
      );
    }
    
    // // file uploading
    // if(req.files) {
    //   const photo: any = req.files?.photo;
      
    //   if(photo?.size > 2100000) {
    //     return sendError({message: {file: 'You can not upload the avatar image more than 2.1MB'}}, 400, req, res);
    //   }
      
    //   const fileContent = Buffer.from(photo?.data, 'binary');
    //   const fileName = `user-${req.user._id}-avatar-${Date.now()}.jpg`;

    //   // Delete the old avatar file on s3 bucket.
    //   if(req.user?.photo) {
    //     await deleteFilePublic(req.user?.photo);
    //   }
    //   // Upload new avatar file
    //   await uploadFilePublic(fileName, fileContent, 'image/*', 'avatars');
    //   req.body.photo = `avatars/${fileName}`;
    // }
    
    // 3) Update User document
    const id = getMyId(req);
    const updateUser = await User.findByIdAndUpdate(id, req.body, {
      new: true, runValidators: true
    });

    res.status(200).json({
      status: 'success',
      personalInformation: updateUser
      
    });
  } catch(error) {
    sendError(error, 404, req, res);
  }
};

export const getUser = factory.getOne(User);
export const getAllUsers = factory.getAll(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
export const createUser = factory.createOne(User);