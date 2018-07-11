import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Boards } from '../boards';
import { Cards } from '../cards';
import { allowIsBoardMemberNonComment } from '/imports/api/utils';


export const Swimlanes = new Mongo.Collection('swimlanes');

// ----------------------------[     Schema      ]----------------------------

Swimlanes.attachSchema(new SimpleSchema({
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
}));

Swimlanes.helpers({
  cards() {
    return Cards.find(Filter.mongoSelector({
      swimlaneId: this._id,
      archived: false,
    }), { sort: ['sort'] });
  },

  allCards() {
    return Cards.find({ swimlaneId: this._id });
  },

  board() {
    return Boards.findOne(this.boardId);
  },
});

// ----------------------------[   Alow / Deny   ]----------------------------

Swimlanes.allow({
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

// ----------------------------[     Various     ]----------------------------

if (Meteor.isServer) {
  Meteor.startup(() => {
    Swimlanes._collection._ensureIndex({ boardId: 1 });
  });
}