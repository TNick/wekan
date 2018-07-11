import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

import { Cards } from '/imports/api/models/cards';
import { ChecklistItems } from '../checklistItems';
import { allowIsBoardMemberByCard } from '/imports/api/utils';


export const Checklists = new Mongo.Collection('checklists');

// ----------------------------[     Schema      ]----------------------------

Checklists.attachSchema(new SimpleSchema({
  cardId: {
    type: String,
  },
  title: {
    type: String,
    defaultValue: 'Checklist',
  },
  finishedAt: {
    type: Date,
    optional: true,
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
  sort: {
    type: Number,
    decimal: true,
  },
}));

Checklists.helpers({
  itemCount() {
    return ChecklistItems.find({ checklistId: this._id }).count();
  },
  items() {
    return ChecklistItems.find({
      checklistId: this._id,
    }, { sort: ['sort'] });
  },
  finishedCount() {
    return ChecklistItems.find({
      checklistId: this._id,
      isFinished: true,
    }).count();
  },
  isFinished() {
    return 0 !== this.itemCount() && this.itemCount() === this.finishedCount();
  },
  itemIndex(itemId) {
    const items = self.findOne({_id : this._id}).items;
    return _.pluck(items, '_id').indexOf(itemId);
  },
});

// ----------------------------[   Alow / Deny   ]----------------------------

Checklists.allow({
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
    Checklists._collection._ensureIndex({ cardId: 1, createdAt: 1 });
  });
}
