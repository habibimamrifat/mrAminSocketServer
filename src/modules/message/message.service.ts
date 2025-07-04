import { Types } from 'mongoose';
import { MessageModel } from './message.model';

const getPreviousMessages = async (
  sender: Types.ObjectId,
  recipient: Types.ObjectId,
) => {
  try {
    const messages = await MessageModel.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp
    return messages;
  } catch (error) {
    throw new Error('Error occared wile fetching messages');
  }
};

const messageServices = {
  getPreviousMessages,
};

export default messageServices;
