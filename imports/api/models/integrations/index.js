import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Integrations = new Mongo.Collection('integrations');

Integrations.attachSchema(new SimpleSchema({
  enabled: {
    type: Boolean,
    defaultValue: true,
  },
  title: {
    type: String,
    optional: true,
  },
  type: {
    type: String,
    defaultValue: 'outgoing-webhooks',
  },
  activities: {
    type: [String],
    defaultValue: ['all'],
  },
  url: { // URL validation regex (https://mathiasbynens.be/demo/url-regex)
    type: String,
  },
  token: {
    type: String,
    optional: true,
  },
  boardId: {
    type: String,
  },
  createdAt: {
    type: Date,
    denyUpdate: false,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert) {
        return new Date();
      } else {
        this.unset();
      }
    },
  },
  userId: {
    type: String,
  },
}));
