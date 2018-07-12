import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating-runtime';

import { SubsManager } from 'meteor/meteorhacks:subs-manager';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Popup } from '/imports/ui/components/utils/popup';
import { Boards } from '/imports/api/models/boards';
import './boardsList.tpl.jade';
import './boardsList.styl';


const subManager = new SubsManager();

Template.boardsList.onCreated(() => {
  Meteor.subscribe('setting');
});

Template.boardsList.helpers({
  boards() {
    return Boards.find({
      archived: false,
      'members.userId': Meteor.userId(),
    }, {
      sort: ['title'],
    });
  },

  isStarred() {
    const user = Meteor.user();
    return user && user.hasStarred(this.currentData()._id);
  },

  hasOvertimeCards() {
    subManager.subscribe('board', this.currentData()._id);
    return this.currentData().hasOvertimeCards();
  },

  hasSpentTimeCards() {
    subManager.subscribe('board', this.currentData()._id);
    return this.currentData().hasSpentTimeCards();
  },

  isInvited() {
    const user = Meteor.user();
    return user && user.isInvitedTo(this.currentData()._id);
  },

});

Template.boardsList.events({
  'click .js-add-board': Popup.open('createBoard'),
  'click .js-star-board'(evt) {
    const boardId = this.currentData()._id;
    Meteor.user().toggleBoardStar(boardId);
    evt.preventDefault();
  },
  'click .js-accept-invite'() {
    const boardId = this.currentData()._id;
    Meteor.user().removeInvite(boardId);
  },
  'click .js-decline-invite'() {
    const boardId = this.currentData()._id;
    Meteor.call('quitBoard', boardId, (err, ret) => {
      if (!err && ret) {
        Meteor.user().removeInvite(boardId);
        FlowRouter.go('home');
      }
    });
  },
});
