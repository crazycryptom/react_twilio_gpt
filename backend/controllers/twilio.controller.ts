require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import twilio from "twilio";
import OpenAI from "openai";
import {
  createReplyFromFineTunedModel,
  getFineTuneModelName,
  
} from "../controllers/gpt.controller";
import Chat from "../models/chat.model";
import * as factory from "./assets/crud.controller";
import Twilio from "./../models/twilio.model";
import { getMyId } from "./user.controller";
import User from "../models/user.model";
import Agent from "../models/agent.model";
import sendError from "./assets/error.controller";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// make a call
export const handleMakingCall = async (req: Request, res: Response) => {
  //   const twilioNumber = '+18667215548';
  // const forwardNumber = '+14199316260';
  // // const forwardNumber = '+18587908018';
  // const clientNumber = '+18587908018';
  // const clientNumber = '+14199316260';
  // client.calls
  //   .create({
  //     twiml: "<Response><Say>Ahoy, World!</Say></Response>",
  //     to: clientNumber,
  //     from: twilioNumber,
  //   })
  //   .then((call) => res.send(call.sid));
};

// Handle validation
export const handleValidation = async (req: Request, res: Response) => {
  let { numberToValidate } = req.body;
  
  if (!numberToValidate) {
    return sendError({message: 'Phone number is required'}, 400, req, res)
  }

  if (numberToValidate.slice(0, 1) !== "+") {
    numberToValidate = "+" + numberToValidate;
  }

  try {
    const resp = await client.validationRequests.create({
      friendlyName: "client" + numberToValidate,
      phoneNumber: numberToValidate,
    });

    const validationCode = resp.validationCode;
    res.status(200).json({
      status: "success",
      data: validationCode,
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

// Handle incoming calls
export const handleIncomingCall = async (req: Request, res: Response) => {

  console.log('request to voice URL')
  const voiceResponse = new twilio.twiml.VoiceResponse();

  const twilioNumber = req.body.To;
  const forwardNumber = await getUserNumberFromTwilioNumber(twilioNumber);

  if (!forwardNumber) {
    voiceResponse.say('We are sorry. We can not forward your call')
    voiceResponse.hangup()
    return res.type('text/xml').send(voiceResponse.toString())
  }
  
  // add number to dial
  const dial = voiceResponse.dial({
    timeout: 20, //set the timeout for the call
    action: "/api/v1/twilio/no-answer", //Endpoint to handle call end event
  });

  dial.number({
    machineDetection: "true",
    amdStatusCallback: "/api/v1/twilio/machine-detection"
  }, forwardNumber)

  res.type("text/xml");
  res.send(voiceResponse.toString());
};

// Get the user's phone number from the twilio number
const getUserNumberFromTwilioNumber = async (twilioNumber: string) => {

  const userId = await getUserIdFromTwilioNumber(twilioNumber);
  const user = await User.findById(userId);
  if (!user) {
    return 
  }
  const forwardNumber = user.dialCode + user.phoneNumber;
  return forwardNumber
}

// Handle machine detection
export const handleMachineDetection = (req: Request, res: Response) => {
  const callStatus = req.body.AnsweredBy;
  if (callStatus === 'human') {
    console.log('Call answered by a human')
  } else if (callStatus === 'machine_end_beep') {
    const voiceResponse = new twilio.twiml.VoiceResponse();
    voiceResponse.hangup();
    voiceResponse.redirect({
      method: 'POST',
    }, '/api/v1/twilio/no-answer')
    res.type('text/xml').send(voiceResponse.toString())
  }
}

// Handle no answer
export const handleNoAnswer = (req: Request, res: Response) => {
  console.log("enter handle no ansewr");

  const { DialCallStatus, To, From } = req.body;

  // Check if there was no answer
  if (!DialCallStatus || DialCallStatus === "no-answer") {
    client.messages
      .create({
        to: From,
        from: To,
        body: "I am an AI assistant. How can I help you?",
      })
      .then((message) => {
        console.log("sent message");
      })
      .catch((error) => {
        console.error("Error sending SMS:", error);
      });
  }
};

//Handle voice mail recording
export const handleVoiceMail = (req: Request, res: Response) => {
  const voiceResponse = new twilio.twiml.VoiceResponse();

  voiceResponse.say("Please leave a message after the beep");
  voiceResponse.record({
    action: "/api/v1/twilio/handle-voicemail",
    maxLength: 60,
    timeout: 5,
  });

  res.type("text/xml").send(voiceResponse.toString());
};

// Handle sms conversation
// export const handleConversation = async (req: Request, res: Response) => {
//   try {
//     const twiml = new twilio.twiml.MessagingResponse();
//     const { From, To, Body, DateSent } = req.body;

//     // Get userId from Twilio number
//     const userId = await getUserIdFromTwilioNumber(To);

//     //Get agent information from that userID
//     const agent = await Agent.findOne({ userId });

//     if (!agent) {
//       twiml.message("Sorry, I can not answer anything now.")
//       return res.type('text/xml').send(twiml.toString())
//     }
//     const sysInstruciton = agent.context + agent.businessInfo + agent.siteUrls + agent.rules;
//     const modelName = await getModelName(agent);

//     //Get reply from gpt model
//     const gptReply = await createReplyFromFineTunedModel(Body, modelName, sysInstruciton);

//     //Send message to the client with gpt reply
//     twiml.message(gptReply as string);

//     const chat = await Chat.findOne({ userId, twilioNumber: To, customerNumber: From });

//     if (!chat) {
//       //Store chatlog to the database
//       const newSMSLog = new Chat({
//         customerNumber: From,
//         twilioNumber: To,
//         messages: [{
//           in: Body,
//           out: gptReply
//         }],
//         userId,
//         date: Date.now(),
//       });
//       await newSMSLog.save();
//     } else {
//       chat.messages.push({
//         in: Body as string,
//         out: gptReply as string
//       });
//       chat.date = Date.now()
//       await chat.save()
//     }

//     res.type("text/xml").send(twiml.toString());
//   } catch (error) {
//     console.log(error);
//   }
// };

//Handle phone number search
export const searchTwilioNumber = async (req: Request, res: Response) => {
  try {
    const { areaCode, dialCode, phoneType } = req.body;
    let phoneNumbers: any = [];
    switch (phoneType) {
      case "local":
        phoneNumbers = await client
          .availablePhoneNumbers(dialCode)
          .local.list({ areaCode: areaCode, limit: 30 });
        break;
      case "tollFree":
        phoneNumbers = await client
          .availablePhoneNumbers(dialCode)
          .tollFree.list({ limit: 30 });
        break;
      default:
        console.error("Ivalid Phone type:", phoneType);
        break;
    }

    res.status(200).send({
      status: "success",
      phoneNumbers,
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

// Handle buy phone number
export const buyTwilioNumber = async (req: Request, res: Response) => {
  try {
    const { selectedNumber } = req.body;
    console.log(selectedNumber)
    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: selectedNumber,
      smsUrl: `${process.env.BASE_API_URL}/twilio/sms`,
      voiceUrl: `${process.env.BASE_API_URL}/twilio/voice`,
    });
    res.status(200).send({
      status: "success",
      purchasedNumber,
    });
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

// Handle delete phone number
export const deleteNumberFromTwilio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sid, _id } = req.body;

    await client.incomingPhoneNumbers(sid).remove();

    req.params.id = _id;
    next();
  } catch (error) {
    sendError(error, 400, req, res);
  }
};

export const getUserIdFromTwilioNumber = async (twilioNumber: string) => {
  const callSetting = await Twilio.findOne({ phoneNumber: twilioNumber });
  if (!callSetting) {
    return;
  }
  return callSetting.userId;
};

export const deleteNumber = factory.deleteOne(Twilio);

//Handle save phone number to the database
export const handleSaveNumber = factory.createOne(Twilio);

// Handle get phone number
export const getNumbers = factory.getAll(Twilio);


