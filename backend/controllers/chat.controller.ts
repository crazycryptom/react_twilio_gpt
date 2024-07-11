import * as factory from './assets/crud.controller';
import Chat from '../models/chat.model';

// export const getAgent = factory.getOne(Chat);
export const getAllChats = factory.getAll(Chat);
// export const updateAgent = factory.updateOne(Chat);
export const deleteChat = factory.deleteOne(Chat);
// export const createAgent = factory.createOne(Chat);