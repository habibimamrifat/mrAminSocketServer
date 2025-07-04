import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConverter';
import messageServices from './message.service';

const getPreviousMessages = catchAsync(async (req, res) => {
  const sender = req.user.id;
  const convertedUserId = idConverter(sender) as Types.ObjectId;
  const receiver = req.query.receiver as string;
  const ConvertedReceiver = idConverter(receiver) as Types.ObjectId;
  if (!convertedUserId || ConvertedReceiver) {
    throw new Error('incvalid user id or user id  is not found ');
  }

  const result = await messageServices.getPreviousMessages(convertedUserId,ConvertedReceiver);
  res.status(200).json({
    status: 'success',
    data: {
      messages: result,
    },
  });
  
});

const messageController = {
  getPreviousMessages,
};

export default messageController;
