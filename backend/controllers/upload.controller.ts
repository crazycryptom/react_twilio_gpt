import { NextFunction, Request, Response } from "express";
import Upload from "../models/upload.model";
import * as factory from "./assets/crud.controller";
import * as fs from "fs";
import sendError from "./assets/error.controller";
import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import Agent from "../models/agent.model";
import { BufferMemory } from "langchain/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";

const embeddings = new OpenAIEmbeddings();
const pinecone = new Pinecone();

// export const deleteMetaData = factory.deleteOne(Upload);
export const getUploadedFiles = factory.getAll(Upload);

// //////////////////////////////////////////////////////////////////

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

//   const multerFilter = (req: Request, file: any, cb: any) => {
//     if(file.mimetype === 'text/csv') {
//       cb(null, true);
//     }
//   };

export const upload = multer({
  storage: multerStorage,
  // fileFilter: multerFilter,
});

export const uploadMiddleware = upload.single("file");

// /////////////////////////////////////////////////////////////////////

export const createMetaData = async (req: Request, res: Response) => {
  try {
    if (!req.file)
      return sendError({ message: "File not uploaded" }, 400, req, res);

    const uploadedFile = await Upload.create({
      ...req.body,
      fileName: req.file.filename,
      fileOriginalName: req.file.originalname,
    });

    res.status(200).json({
      status: "success",
      data: uploadedFile,
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

export const deleteFileFromFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const metaId = req.params.id;
    const meta = await Upload.findById(metaId);
    if (meta) {
      fs.unlinkSync(`uploads/${meta.fileName}`);
    }
    next();
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

export const deleteMetaData = async (req: Request, res: Response) => {
  try {
    console.log("deleting ...");
    const uploadedFile = await Upload.findById(req.params.id);
    if (!uploadedFile) {
      return sendError({ message: "Uploaded File not found" }, 400, req, res);
    }

    const agent = await Agent.findById(uploadedFile.agentId);
    if (!agent) {
      return sendError({ message: "Agent not found" }, 400, req, res);
    }

    // Delete all records based on the common id prefix
    const pineconeIndex = pinecone
      .index(agent.pineconeIndex)
      .namespace(agent.pineconeIndexNamespace);
    const results = await pineconeIndex.listPaginated({
      prefix: `${uploadedFile.idPrefix}`,
    });
    const vectorIds = results.vectors?.map((vector) => vector.id);
    if (vectorIds && vectorIds.length > 0) {
      await pineconeIndex.deleteMany(vectorIds);
    }

    // Delete the uploaded file from the server
    fs.unlinkSync(`uploads/${uploadedFile.fileName}`);

    // Delete the uploaded file data from the DB
    await Upload.deleteOne();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    sendError(err, 404, req, res);
  }
};

// Calculate average embedding of embeddings
export const calculateAggregatedEmbedding = (embeddings: number[][]) => {
  if (embeddings.length === 0) {
    return [];
  }

  const dimension = embeddings[0].length;
  const sumEmbedding = new Array(dimension).fill(0);

  for (let i = 0; i < embeddings.length; i++) {
    for (let j = 0; j < dimension; j++) {
      sumEmbedding[j] += embeddings[i][j];
    }
  }

  const avgEmbedding = sumEmbedding.map((value) => value / embeddings.length);
  return avgEmbedding;
};

// Store embeddings of uploaded documnents
export const handleEmbeddings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file)
      return sendError({ message: "File not uploaded" }, 400, req, res);

    // const newTitle = req.body.title.replace(/[^\w]+/g, '_');
    // req.body.pineconeIndexNamespace = newTitle;

    const agentId = req.params.agentId;
    const agent = await Agent.findById(agentId);
    if (!agent) return sendError({ message: "Agent not found" }, 400, req, res);

    const filePath = `uploads/${req.file.filename}`;
    const fileExtension = req.file.mimetype;

    

    let loader;
    let pageContent = ""
    switch (fileExtension) {
      case "text/csv":
        loader = new CSVLoader(filePath)
        break;
      case "application/pdf":
        loader = new PDFLoader(filePath);
        break;
      default:
        return sendError({ message: "File loading failed" }, 400, req, res);
    }

 
    const chunks = await loader.load()
    if (chunks && chunks.length > 0) {
      chunks.map((chunk) => {
        pageContent += chunk.pageContent
      })
    }

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    const docs = await textSplitter.createDocuments([pageContent])
    
    const ids = docs.map((doc, i) => `${req.body.idPrefix}#${i + 1}`);
    const pineconeIndex = pinecone.Index(`${agent.pineconeIndex}`);

    const pineconeStore = new PineconeStore(embeddings, {
      pineconeIndex,
      namespace: `${agent.pineconeIndexNamespace}`,
    });
    await pineconeStore.addDocuments(docs, ids);

    next();
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

// Get answers from Pinecone vectorstore and langchain
export const getAnswer = async (req: Request, res: Response) => {
  try {
    const { question, context, id } = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return sendError({ message: "No agent found" }, 400, req, res);
    }

    const model = new ChatOpenAI({ modelName: "gpt-4" });
    const pineconeIndex = pinecone.Index(agent.pineconeIndex);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: `${agent.pineconeIndexNamespace}`,
    });

    const retriever = vectorStore.asRetriever();

    const formatChatHistory = (
      human: string,
      ai: string,
      previousChatHistory: string
    ) => {
      const newInteraction = `Human: ${human}\nAI: ${ai}`;
      if (!previousChatHistory) {
        return newInteraction;
      }
      return `${previousChatHistory}\n\n${newInteraction}`;
    };

    const questionPrompt = PromptTemplate.fromTemplate(
      `You are an assistant. You should act as a company agent. Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  CONTEXT: {context}
  ----------------
  CHAT HISTORY: {chatHistory}
  ----------------
  QUESTION: {question}
  ----------------
  Helpful Answer:`
    );

    const chain = RunnableSequence.from([
      {
        question: (input: { question: string; chatHistory?: string }) =>
          input.question,
        chatHistory: (input: { question: string; chatHistory?: string }) =>
          input.chatHistory ?? "",
        context: async (input: { question: string; chatHistory?: string }) => {
          const relevantDocs = await retriever.getRelevantDocuments(
            input.question
          );
          const serialized = formatDocumentsAsString(relevantDocs);
          console.log(serialized);
          return serialized;
        },
      },
      questionPrompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      question: question,
      chatHistory: context,
    });

    res.status(200).json({
      status: "success",
      answer: result,
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

export const getAnswer2 = async (req: Request, res: Response) => {
  try {
    const { question, context, id } = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return sendError({ message: "No agent found" }, 400, req, res);
    }

    // buffer memory
    const bufferMemory = new BufferMemory({
      memoryKey: "chat_history",
    });

    //summary memory
    // const summaryMemory = new ConversationSummaryMemory({
    //   llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0}),
    //   inputKey: "question",
    //   memoryKey: "conversation_summary"
    // })

    // const memory = new CombinedMemory({
    //   memories: [bufferMemory, summaryMemory]
    // })

    const _DEFAULT_TEMPLATE = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

                              Current conversation:
                              {chat_history}
                              Human: {question}
                              AI:`;

    // const PROMPT = new PromptTemplate({
    //   inputVariables: ["question", "conversation_summary", "chat_history_lines"],
    //   template: _DEFAULT_TEMPLATE
    // })

    const llm = new ChatOpenAI({ temperature: 0.9 });

    const pineconeIndex = pinecone.Index(`${agent.pineconeIndex}`);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    const retriever = vectorStore.asRetriever();
    // const questionGeneratorChain = new LLMChain({llm: llm, prompt: PROMPT})
    const chain = ConversationalRetrievalQAChain.fromLLM(llm, retriever, {
      memory: bufferMemory,
      questionGeneratorChainOptions: {
        llm: llm,
        template: _DEFAULT_TEMPLATE,
      },
    });

    const result = await chain.invoke({ question });
    console.log(result.text);

    res.status(200).json({
      status: "success",
      // answer: result,
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};
export const getAnswer3 = async (req: Request, res: Response) => {
  try {
    const { question, context, id } = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return sendError({ message: "No agent found" }, 400, req, res);
    }

    const fasterModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
    });
    const slowerModel = new ChatOpenAI({
      modelName: "gpt-4",
    });

    const pineconeIndex = pinecone.Index(`${agent.pineconeIndex}`);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
      slowerModel,
      vectorStore.asRetriever(),
      {
        returnSourceDocuments: true,
        memory: new BufferMemory({
          memoryKey: "chat_history",
          inputKey: "question", // The key for the input to the chain
          outputKey: "text", // The key for the final conversational output of the chain
          returnMessages: true, // If using with a chat model (e.g. gpt-3.5 or gpt-4)
        }),
        questionGeneratorChainOptions: {
          llm: fasterModel,
        },
      }
    );

    const response = await chain.invoke({ question });
    console.log(response.text);

    res.status(200).json({
      status: "success",
      answer: response.text,
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};
