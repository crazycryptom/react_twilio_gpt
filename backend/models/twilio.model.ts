import mongoose, { Schema } from "mongoose";

const TwilioSchema = new mongoose.Schema(
    {
        friendlyName: { type: String },
        phoneNumber: { type: String },
        locality: { type: String },
        sid: { type: String },
        capabilities: {
            MMS: Boolean,
            SMS: Boolean,
            voice: Boolean
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Twilio number must belong to a user.']
        },
    },
    {timestamps: true}
    
);

const Twilio = mongoose.model("Twilio", TwilioSchema);

export default Twilio;