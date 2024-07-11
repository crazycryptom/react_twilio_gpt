import mongoose, { Document } from "mongoose";

export interface ITraining extends Document {
    context: string;
    rule: string;
    companyInformation: string;
}

const TrainingSchema = new mongoose.Schema<ITraining>(
    {
        context: {
            type: String,
        },
        rule: {
            type: String,
        },
        companyInformation: {
            type: String,
        },
      
    },
    { timestamps: true }
);

const Training = mongoose.model("Training", TrainingSchema);

export default Training;