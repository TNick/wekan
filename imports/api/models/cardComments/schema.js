import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { allowIsBoardMember } from '/imports/api/utils';
import { Boards } from '/imports/api/models/boards';


export const CardComments = new Mongo.Collection('card_comments');

CardComments.attachSchema(new SimpleSchema({
  boardId: {
    type: String,
  },
  cardId: {
    type: String,
  },
  // XXX Rename in `content`? `text` is a bit vague...
  text: {
    type: String,
  },
  // XXX We probably don't need this information here, since we already have it
  // in the associated comment creation activity
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
  // XXX Should probably be called `authorId`
  userId: {
    type: String,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        return this.userId;
      }
    },
  },
}));


// ----------------------------[   Alow / Deny   ]----------------------------

CardComments.allow({
  insert(userId, doc) {
    return allowIsBoardMember(userId, Boards.findOne(doc.boardId));
  },
  update(userId, doc) {
    return userId === doc.userId;
  },
  remove(userId, doc) {
    return userId === doc.userId;
  },
  fetch: ['userId', 'boardId'],
});

// ----------------------------[     Various     ]----------------------------
if (Meteor.isServer) {
  // Comments are often fetched within a card, so we create an index to make these
  // queries more efficient.
  Meteor.startup(() => {
    CardComments._collection._ensureIndex({ cardId: 1, createdAt: -1 });
  });
}
