import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Cards } from '/imports/api/models/cards';
import { allowIsBoardMemberByCard } from '/imports/api/utils';


export const ChecklistItems = new Mongo.Collection('checklistItems');

// ----------------------------[     Schema      ]----------------------------

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

// ----------------------------[   Alow / Deny   ]----------------------------

ChecklistItems.allow({
  insert(userId, doc) {
    return allowIsBoardMemberByCard(userId, Cards.findOne(doc.cardId));
  },
  update(userId, doc) {
    return allowIsBoardMemberByCard(userId, Cards.findOne(doc.cardId));
  },
  remove(userId, doc) {
    return allowIsBoardMemberByCard(userId, Cards.findOne(doc.cardId));
  },
  fetch: ['userId', 'cardId'],
});

// ----------------------------[     Various     ]----------------------------

if (Meteor.isServer) {
  Meteor.startup(() => {
    ChecklistItems._collection._ensureIndex({ checklistId: 1 });
  });
}
