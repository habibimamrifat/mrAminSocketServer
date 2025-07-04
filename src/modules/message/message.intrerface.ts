import { Types } from 'mongoose';
import { string } from 'zod';

export type TMessage = {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
};
