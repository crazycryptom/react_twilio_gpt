import mongoose, { Document } from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';

export interface IUser extends Document {
    firstName: string
    lastName: string
    email: string
    dialCode: string
    phoneNumber: string
    avatar: string
    country: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    zipCode: string
    password: string
    passwordConfirm: string
    passwordChangedAt: Date
    passwordResetToken: string | undefined
    passwordResetExpires: Date | undefined
    authority: string[]
    createPasswordResetToken: () => string
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Please provide an email'],
            validate: [validator.isEmail, 'Please provide a valid email']
        },
        dialCode: String,
        phoneNumber: {
            type: String,
            // required: [true, 'Please provide your phone number'],
            // validate: [validator.isMobilePhone, 'Please provide a valid phone number']
        },
        avatar: String,
        country: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        zipCode: String,
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password length must be more or equal than 8'],
            select: false
        },
        passwordConfirm: {
            type: String,
            // required: [true, 'Please confirm your password'],
            // validate: {
            //     // This only works on CREATE and SAVE!
            //     validator: function(el: any): any {
            //       const self: any = this;
            //       return el === self.password;
            //     },
            //     message: 'PasswordConfirm must match the Password'
            //   }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        authority: String
    },
    { timestamps: true }

);


//pre-save middleware
UserSchema.pre('save', async function (next) {
    const self: any = this;
    // Hash password if the password in new or was updated
    if (!self.isModified('password')) return next();

    // Hash the password with cost of 12
    self.password = await bcrypt.hash(self.password, 12);

    // Delete passwordConfirm field
    self.passwordConfirm = '';
    next();
});

UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    return resetToken;
}

const User = mongoose.model("User", UserSchema);

export default User;