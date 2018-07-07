import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export const AccountSettings = new Mongo.Collection('accountSettings');

AccountSettings.attachSchema(new SimpleSchema({
  _id: {
    type: String,
  },
  booleanValue: {
    type: Boolean,
    optional: true,
  },
  sort: {
    type: Number,
    decimal: true,
  },
}));
