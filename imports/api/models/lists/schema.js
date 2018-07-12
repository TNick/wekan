import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { allowIsBoardMemberNonComment } from '/imports/api/utils';
import { Boards } from '/imports/api/models/boards';
import { simpleWatchable } from '/imports/api/utils/watchable';


export const Lists = new Mongo.Collection('lists');

// ----------------------------[     Schema      ]----------------------------

Lists.attachSchema(new SimpleSchema({
  title: {
    type: String,
  },
  archived: {
    type: Boolean,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        return false;
      }
    },
  },
  boardId: {
    type: String,
  },
  createdAt: {
    type: Date,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert) {
        return new Date();
      } else {
        this.unset();
      }
    },
  },
  sort: {
    type: Number,
    decimal: true,
    // XXX We should probably provide a default
    optional: true,
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isUpdate) {
        return new Date();
      } else {
        this.unset();
      }
    },
  },
  wipLimit: {
    type: Object,
    optional: true,
  },
  'wipLimit.value': {
    type: Number,
    decimal: false,
    defaultValue: 1,
  },
  'wipLimit.enabled': {
    type: Boolean,
    defaultValue: false,
  },
  'wipLimit.soft': {
    type: Boolean,
    defaultValue: false,
  },
}));


// ----------------------------[   Alow / Deny   ]----------------------------

Lists.allow({
  insert(userId, doc) {
    return allowIsBoardMemberNonComment(userId, Boards.findOne(doc.boardId));
  },
  update(userId, doc) {
    return allowIsBoardMemberNonComment(userId, Boards.findOne(doc.boardId));
  },
  remove(userId, doc) {
    return allowIsBoardMemberNonComment(userId, Boards.findOne(doc.boardId));
  },
  fetch: ['boardId'],
});

simpleWatchable(Lists);
