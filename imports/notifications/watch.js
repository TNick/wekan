import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { Boards } from '/imports/api/models/boards';
import { Lists } from '/imports/api/models/lists';
import { Cards } from '/imports/api/models/cards';


Meteor.methods({
  watch(watchableType, id, level) {
    check(watchableType, String);
    check(id, String);
    check(level, Match.OneOf(String, null));

    const userId = Meteor.userId();

    let watchableObj = null;
    let board = null;
    if (watchableType === 'board') {
      watchableObj = Boards.findOne(id);
      if (!watchableObj) throw new Meteor.Error('error-board-doesNotExist');
      board = watchableObj;

    } else if (watchableType === 'list') {
      watchableObj = Lists.findOne(id);
      if (!watchableObj) throw new Meteor.Error('error-list-doesNotExist');
      board = watchableObj.board();

    } else if (watchableType === 'card') {
      watchableObj = Cards.findOne(id);
      if (!watchableObj) throw new Meteor.Error('error-card-doesNotExist');
      board = watchableObj.board();

    } else {
      throw new Meteor.Error('error-json-schema');
    }

    if ((board.permission === 'private') && !board.hasMember(userId))
      throw new Meteor.Error('error-board-notAMember');

    watchableObj.setWatcher(userId, level);
    return true;
  },
});
