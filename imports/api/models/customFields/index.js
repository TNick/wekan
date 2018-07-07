import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const CustomFields = new Mongo.Collection('customFields');

CustomFields.attachSchema(new SimpleSchema({
  boardId: {
    type: String,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: ['text', 'number', 'date', 'dropdown'],
  },
  settings: {
    type: Object,
  },
  'settings.dropdownItems': {
    type: [Object],
    optional: true,
  },
  'settings.dropdownItems.$': {
    type: new SimpleSchema({
      _id: {
        type: String,
      },
      name: {
        type: String,
      },
    }),
  },
  showOnCard: {
    type: Boolean,
  },
}));
