// Import Mongoose for MongoDB schema definition
import mongoose, { Schema } from 'mongoose';
import { TMessage } from './message.intrerface';


// Define schema for chat messages
const messageSchema = new mongoose.Schema<TMessage>({
  sender: { type: Schema.Types.ObjectId, required: true, ref:"userCollection" }, // Username of the sender
  recipient: { type: Schema.Types.ObjectId, required: true, ref:"userCollection" }, // Username of the recipient
  content: { type: String, required: true }, // Message text
},
{timestamps:true});

// Export the Message model
export const MessageModel =  mongoose.model('MessageCollection', messageSchema);
 