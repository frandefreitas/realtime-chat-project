import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  collection: 'messages',
})
export class Message {
  @Prop({ required: true }) from: string;
  @Prop({ required: true }) to: string;
  @Prop({ required: true }) text: string;
  @Prop({ required: true }) ts: number;
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ from: 1, to: 1, ts: 1 });
MessageSchema.index({ to: 1, from: 1, ts: 1 });
