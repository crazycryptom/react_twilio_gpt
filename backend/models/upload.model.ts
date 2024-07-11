import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUpload extends Document {
    description: string
    fields: string
    fileName: string
    fileContent: string
    metaData: string
    fileOriginalName: string
    filePath: string
    title: string
    idPrefix: string
    agentId: Types.ObjectId
}

const UploadSchema = new mongoose.Schema<IUpload>(
    {   
        description: { type: String },
        fields: { type: String },
        fileName: { type: String },
        fileContent: { type: String },
        metaData: { type: String },
        fileOriginalName: { type: String },
        filePath: { type: String },
        title: { type: String },
        idPrefix: { type: String },
        agentId: {
            type: Schema.Types.ObjectId,
            ref: 'Agent',
            required: [true, 'Uploaded data must belong to an agent.']
        },
    },
    { timestamps: true }
);

const Upload = mongoose.model("Upload", UploadSchema);

export default Upload;