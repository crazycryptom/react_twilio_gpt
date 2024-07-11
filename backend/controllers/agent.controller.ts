require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import * as factory from "./assets/crud.controller";
import Agent from "../models/agent.model";
import fs from "fs";
import {
  getFineTuneModelName,
} from "./gpt.controller";
import { Pinecone } from '@pinecone-database/pinecone'
import sendError from './assets/error.controller';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

type QA = {
  question: string;
  answer: string;
};

export const getAgent = factory.getOne(Agent);
export const getAllAgents = factory.getAll(Agent);
// export const updateAgent = factory.updateOne(Agent);


// Create a new agent
export const createAgent = async (req: Request, res: Response) => {
  try {
    // Create a new agnet
    const agent = await Agent.create(req.body);

    // Create a pinecone index for a newly created agent
    const pineconeIndexName = process.env.PINECONE_INDEX as string
    agent.pineconeIndexNamespace = `business-${Date.now()}`
    agent.pineconeIndex = pineconeIndexName
    await agent.save()
    
    res.status(200).json({
      status: "success",
      data: agent,
    });
  } catch (err) {
    sendError(err, 404, req, res);
  }
}

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const agent = await Agent.findById(id)
    if (!agent) return sendError({ message: "Agent not found" }, 400, req, res);
    
    // First, delete an index from pinecone
    await pc.deleteIndex(`${agent.pineconeIndex}`)

    // Second, delete the agent
    await agent.deleteOne()
    
    res.status(204).json({
      status: 'success',
      data: null
  });
  } catch (error) {
    sendError(error, 404, req, res);
  }
}
export const setAgentIdtoBody = (req: Request, res: Response, next: NextFunction) => {
  const agentId = req.params.agentId
  req.body.agentId = agentId
  next()
}

export const setAgentIdtoQuery = (req: Request, res: Response, next: NextFunction) => {
  const agentId = req.params.agentId
  req.query.agentId = agentId
  next()
}

export const updateAgentInformation = async (req: Request, res: Response) => {
  try {
    
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    });

    if (!agent) {
      throw new Error("No agent found with that ID");
    }

    res.status(200).send({
      status: "success",
      data: agent,
    });
  } catch (error) {
    console.log(error)
    sendError(error, 400, req, res);
  }
};


// export const postQAListHandler = async (req: Request, res: Response) => {
//   try {
//     // get qa list
//     const { businessInfo, qaList, siteUrls, context } = req.body;
    
//     // get agent id
//     const agentId = req.params.id;
//     const agent = await Agent.findById(agentId);

//     if (!agent) {
//       return sendError({message: 'Agent not found'}, 400, req, res);
//     }

//     // Check if the pre defined finetune file exists
//     if (agent.fineTuneFile) {
//       const { fineTuneFile, fineTuneId, fineTuneFileId } = agent;

//       // Delete the existing finetune file
//       fs.unlinkSync(fineTuneFile);

//       // Delete the uploaded fine-tune file from storage
//       await deleteFineTuneFile(fineTuneFileId);

//       // Delete the existing finetuned model
//       const fineTunedModelName = await getFineTuneModelName(fineTuneId);
//       if (fineTunedModelName) {
//         await removeFineTunedModel(fineTunedModelName);
//       }
//     }
    
//     // create finetune file

//     const fineTuneFileUrl = buildJsonL(agentId, qaList);
//     const fineTuneFileId = await uploadFile(fineTuneFileUrl);
//     if (!fineTuneFileId) {
//       return sendError({message: 'Can not upload fine tune file'}, 400, req, res);
//     }

//     const fineTuneId = await makeFineTune(fineTuneFileId);
//     if (!fineTuneId) {
//       return sendError({message: 'Can not train fine tune model'}, 400, req, res);
//     }

    
//     agent.fineTuneFile = fineTuneFileUrl;
//     agent.fineTuneFileId = fineTuneFileId;
//     agent.fineTuneId = fineTuneId;
//     agent.fineTunedModelName = "";
//     await agent.save();
    
//     res.status(200).json({ 
//       status: "success",
//       data: agent
//     });
//   } catch (error) {
//     console.log(error);
//     sendError(error, 400, req, res)
//   }
// };

const buildJsonL = (
  agentId: string,
  qas: QA[],
 
): string => {
  const fileName = `fineTune-${agentId}.jsonl`;
  let fileContent = "";
  const systemInstruction = 'You are an assistant. You should remember following question and answer sample. When a user asks you this question, you should reply like a sample answer.'
  for (const qa of qas) {
    const message = `{"messages": [{"role": "system", "content": "${systemInstruction}"}, {"role": "user", "content": "${qa.question}"}, {"role": "assistant", "content": "${qa.answer}"}]}\n`;
    fileContent += message;
  }

  // save string to file
  fs.writeFileSync(fileName, fileContent);
  return fileName;
};

async function waitForFineTunedModelName(
  fineTunedId: string
): Promise<string | undefined | null> {
  const timeoutMs = 60 * 60 * 1000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const fineTunedModelName = await getFineTuneModelName(fineTunedId);
    if (fineTunedModelName) {
      return fineTunedModelName;
    }
    // Wait for a short duration before retrying
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 60 second
  }

  return null;
}
