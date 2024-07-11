import mongoose, { Document, Schema, Types } from "mongoose";


type message = {
    in: string
    out: string
}

export interface IChat extends Document {
    customerNumber: string
    twilioNumber: string
    messages: message[]
    date: number
    userId: Types.ObjectId
}

const ChatSchema = new mongoose.Schema<IChat>(
    {
        customerNumber: { type: String },
        twilioNumber: { type: String },
        messages:  [{type: {in: String, out: String}}],
        date: { type: Number },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Chat must belong to a user.']
        },
    }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;