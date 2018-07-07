import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Announcements = new Mongo.Collection('announcements');

Announcements.attachSchema(new SimpleSchema({
  enabled: {
    type: Boolean,
    defaultValue: false,
  },
  title: {
    type: String,
    optional: true,
  },
  body: {
    type: String,
    optional: true,
  },
  sort: {
    type: Number,
    decimal: true,
  },
}));

