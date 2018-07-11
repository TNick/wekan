import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Lists } from './schema';

Meteor.methods({
  applyWipLimit(listId, limit){
    check(listId, String);
    check(limit, Number);
    if(limit === 0){
      limit = 1;
    }
    Lists.findOne({ _id: listId }).setWipLimit(limit);
  },

  enableWipLimit(listId) {
    check(listId, String);
    const list = Lists.findOne({ _id: listId });
    if(list.getWipLimit('value') === 0){
      list.setWipLimit(1);
    }
    list.toggleWipLimit(!list.getWipLimit('enabled'));
  },

  enableSoftLimit(listId) {
    check(listId, String);
    const list = Lists.findOne({ _id: listId });
    list.toggleSoftLimit(!list.getWipLimit('soft'));
  },
});
