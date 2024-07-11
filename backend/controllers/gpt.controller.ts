require("dotenv").config();
import OpenAI from "openai";
import * as fs from "fs";
import { Request, Response, NextFunction } from "express";
import sendError from "./assets/error.controller";
import Agent, { IAgent } from "../models/agent.model";
import { getMyId } from "./user.controller";
import { encoding_for_model } from "@dqbd/tiktoken";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type QA = {
  question: string;
  answer: string;
};


// upload file to train
export const uploadFile = async (url: string) => {
  try {
    const file = await openai.files.create({
      file: fs.createReadStream(url),
      purpose: "fine-tune",
    });
    return file.id;
  } catch (err) {
    console.log(err);
  }
};

//make finetune job
export const makeFineTune = async (fileId: string) => {
  try {
    // const fileId = await uploadFile();
    const fineTune = await openai.fineTuning.jobs.create({
      training_file: fileId,
      model: "gpt-3.5-turbo",
      hyperparameters: { n_epochs: 2 },
    });
    return fineTune.id;
  } catch (err: any) {
    console.log("err: ", err.response.data.error);
  }
};

//get finetune model name
export const getFineTuneModelName = async (tuneId: string) => {
  try {
    const fineTune = await openai.fineTuning.jobs.retrieve(tuneId);
    return fineTune.fine_tuned_model;
  } catch (err: any) {
    console.log(err);
  }
};

// list FineTuning Jobs
export const listFineTuningJobs = async () => {
  const list = await openai.fineTuning.jobs.list();

  for await (const fineTune of list) {
    console.log(fineTune);
  }
};

// remove FineTuningJob;
export const removeFineTuningJob = async () => {
  const fineTune = await openai.fineTuning.jobs.cancel(
    "ftjob-wGJcIy5lcBgBRd9gl96bfwe4"
  );

  console.log(fineTune);
};

// remove FineTunedModel;
export const removeFineTunedModel = async (fineTunedModelName: string) => {
  await openai.models.del(fineTunedModelName);
};

// retrieve Models;
export const retrieveModels = async () => {
  const list = await openai.models.list();

  for await (const model of list) {
    console.log(model);
  }
};

// delete finetune files from storage
export const deleteFineTuneFile = async (fineTuneFileId: string) => {
  await openai.files.del(fineTuneFileId);
};

////////////////////////////////////////////////////////////////////////////////////
/**
 *
 * @param req
 * @param res
 * @returns
 * Handle QA list
 */

//create QA list
export const createGeneralReply = async (message: string) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-4",
    });
    const content = completion.choices[0].message.content;
    return content;
  } catch (error) {
    console.log(error);
  }
};

// get qa list from business info
export const getQAListHandler = async (req: Request, res: Response) => {
  try {
    let message;
    let businessInfo;
    let siteUrls;
    let answer;
    const flag = req.params.flag;

    if (flag === "info") {
      const { businessInfo: info } = req.body;
      if (!info) {
        return sendError(
          { message: { info: "Business info not found" } },
          400,
          req,
          res
        );
      }
      businessInfo = info;
      message =
        "Make at least 10 question/answer pairs in the JSON format by using the following business information. Do not include any additional words besides JSON in your response.";
    } else if (flag === "url") {
      const { siteUrls: url } = req.body;

      if (!url) {
        return sendError({ message: { url: "Url not found" } }, 400, req, res);
      }
      siteUrls = url;
      message =
        "Make at least 10 question/answer pairs in the JSON format by scraping the following websites. Do not include any additional words besides JSON in your response.";
    }

    // send request to GPT
    if (flag === "info") {
      answer = await createGeneralReply(
        `${message} The business information is ${businessInfo}`
      );
    } else if (flag === "url") {
      answer = await createGeneralReply(`${message} The urls are ${siteUrls}`);
    }

    res.status(200).json({
      status: "success",
      qaList: isJSON(answer) ? answer : [],
    });
  } catch (error) {
    console.log(error);
    sendError(error, 400, req, res);
  }
};

const isJSON = (variable: any) => {
  try {
    JSON.parse(variable);
    return true;
  } catch (error) {
    return false;
  }
};


export const createReplyFromFineTunedModel = async (
  message: string,
  modelName: string = "gpt-3.5-turbo",
  sysInstruction: string
) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: sysInstruction },
        { role: "user", content: message },
      ],
      model: modelName,
      max_tokens: 100,
      temperature: 0.2,
    });
    const content = completion.choices[0].message.content;
    return content;
  } catch (err) {
    console.log(err);
  }
};

export const createReplyFromGPT3 = async (
  message: string,
  sysInstruction: string
) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: sysInstruction },
        { role: "user", content: message },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      temperature: 0.2,
    });
    const content = completion.choices[0].message.content;
    return content;
  } catch (error) {
    console.log(error);
  }
};

// export const getModelName = async (agent: IAgent) => {
//   let modelName = "gpt-3.5-turbo";

//   if (agent.fineTunedModelName) {
//     modelName = agent.fineTunedModelName;
//   } else if (agent.fineTuneId) {
//     const fineTunedModel = await getFineTuneModelName(
//       agent.fineTuneId as string
//     );

//     if (fineTunedModel) {
//       agent.fineTunedModelName = fineTunedModel;
//       await agent.save();
//       modelName = fineTunedModel;
//     }
//   }
//   return modelName;
// };

// export const getReplyFromTuned = async (req: Request, res: Response) => {
//   try {
//     const { question, id } = req.body;
//     const agent = await Agent.findById(id);
//     if (!agent) {
//       return sendError({ message: "No agent found" }, 400, req, res);
//     }
//     const sysInstruciton =
//       agent.context + agent.businessInfo + agent.siteUrls + agent.rules;
//     const modelName = await getModelName(agent);
//     const answer = await createReplyFromFineTunedModel(
//       question,
//       modelName,
//       sysInstruciton
//     );
//     res.status(200).json({
//       status: "success",
//       answer,
//     });
//   } catch (err) {
//     sendError(err, 400, req, res);
//   }
// };

export const getReplyFromGPT = async (req: Request, res: Response) => {
  try {
    const { question, id, context } = req.body;
    
    const agent = await Agent.findById(id);
    if (!agent) {
      return sendError({ message: "No agent found" }, 400, req, res);
    }

    // sysInstruction += `\nBusiness information: \n\"\"\"\n${agent.businessInfo}\n\"\"\"\n`
    // sysInstruction += ` Additional CSV file content: \n\*\*\*\n${agent.uploadedFileContent}\n\*\*\*\n`
    // sysInstruction += ` Conversation history: \n\#\#\#\n${context}\n\#\#\#\n`
    const sysInstruction = ""
    // console.log('number of tokens:', numTokensFromString(sysInstruction))
    const answer = await createReplyFromGPT3(question, sysInstruction)
    res.status(200).json({
      status: "success",
      answer
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

export const numTokensFromString = (message: string) => {
  const encoder = encoding_for_model("gpt-3.5-turbo");
  const tokens = encoder.encode(message);
  encoder.free();
  return tokens.length;
}

export const generateEmbedding = async (input: string) => {
  
  const numTokens = numTokensFromString(input);

  if (numTokens < 8191) {
    const embeddings = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: input,
      encoding_format: "float",
    });
    return embeddings.data[0].embedding;
  } else {
    return [];
  }
};