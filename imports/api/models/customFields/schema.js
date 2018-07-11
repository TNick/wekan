import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { allowIsBoardMember } from '/imports/api/utils/server/utils';
import { Boards } from '/imports/api/models/boards';


export const CustomFields = new Mongo.Collection('customFields');

// ----------------------------[     Schema      ]----------------------------

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

// ----------------------------[   Alow / Deny   ]----------------------------

CustomFields.allow({
  insert(userId, doc) {
    return allowIsBoardMember(userId, Boards.findOne(doc.boardId));
  },
  update(userId, doc) {
    return allowIsBoardMember(userId, Boards.findOne(doc.boardId));
  },
  remove(userId, doc) {
    return allowIsBoardMember(userId, Boards.findOne(doc.boardId));
  },
  fetch: ['userId', 'boardId'],
});

// ----------------------------[     Various     ]----------------------------

/*if (Meteor.isServer) {
  Meteor.startup(() => {
    CustomFields._collection._ensureIndex({ boardId: 1});
  });
}*/
