import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const ChecklistItems = new Mongo.Collection('checklistItems');

ChecklistItems.attachSchema(new SimpleSchema({
  title: {
    type: String,
  },
  sort: {
    type: Number,
    decimal: true,
  },
  isFinished: {
    type: Boolean,
    defaultValue: false,
  },
  checklistId: {
    type: String,
  },
  cardId: {
    type: String,
  },
}));

