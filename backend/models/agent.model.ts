import mongoose, { Document, Schema, Types } from "mongoose";


type QA = {
    question: string;
    answer: string
}

export interface IAgent extends Document {
    name: string
    organizationName: string
    description: string
    twilioNumber: string
    businessInfo: string
    context: string
    rules: string
    siteUrls: string
    qaList: QA[]
    
    uploadedFileName: string
    uploadedFileContent: string
    pineconeIndex: string
    pineconeIndexNamespace: string
    userId: Types.ObjectId
}

const AgentSchema = new mongoose.Schema<IAgent>(
    {
        name: {
            type: String,
        },
        organizationName: {
            type: String,
        },
        description: {
            type: String,
        },
        twilioNumber: { type: String },
        businessInfo: {type: String, default: ''},
        context: { type: String, default: '' },
        rules: { type: String, default: '' },
        siteUrls: { type: String, default: ''},
        qaList: [{type: {question: String, answer: String}}],
        uploadedFileName: {type: String},
        uploadedFileContent: {type: String},
        pineconeIndex: {type: String},
        pineconeIndexNamespace: {type: String},
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Agent must belong to a user.']
        },
    },
    { timestamps: true }
);

const Agent = mongoose.model("Agent", AgentSchema);

export default Agent;