import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Boards } from './schema';

Meteor.methods({
  quitBoard(boardId) {
    check(boardId, String);
    const board = Boards.findOne(boardId);
    if (board) {
      const userId = Meteor.userId();
      const index = board.memberIndex(userId);
      if (index >= 0) {
        board.removeMember(userId);
        return true;
      } else throw new Meteor.Error('error-board-notAMember');
    } else throw new Meteor.Error('error-board-doesNotExist');
  },
});
