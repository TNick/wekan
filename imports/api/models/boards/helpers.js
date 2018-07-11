import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Random } from 'meteor/random';

import { CustomFields } from '/imports/api/models/customFields';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Users } from '/imports/api/models/users';
import { Cards } from '/imports/api/models/cards';
import { Swimlanes } from '/imports/api/models/swimlanes';
import { Activities } from '/imports/api/models/activities';
import { Lists } from '/imports/api/models/lists';
import { Boards } from './schema';


Boards.helpers({
  /**
   * Is supplied user authorized to view this board?
   */
  isVisibleBy(user) {
    if (this.isPublic()) {
      // public boards are visible to everyone
      return true;
    } else {
      // otherwise you have to be logged-in and active member
      return user && this.isActiveMember(user._id);
    }
  },

  /**
   * Is the user one of the active members of the board?
   *
   * @param userId
   * @returns {boolean} the member that matches, or undefined/false
   */
  isActiveMember(userId) {
    if (userId) {
      return this.members.find((member) => (member.userId === userId && member.isActive));
    } else {
      return false;
    }
  },

  isPublic() {
    return this.permission === 'public';
  },

  lists() {
    return Lists.find({ boardId: this._id, archived: false }, { sort: { sort: 1 } });
  },

  swimlanes() {
    return Swimlanes.find({ boardId: this._id, archived: false }, { sort: { sort: 1 } });
  },

  hasOvertimeCards(){
    const card = Cards.findOne({isOvertime: true, boardId: this._id, archived: false} );
    return card !== undefined;
  },

  hasSpentTimeCards(){
    const card = Cards.findOne({spentTime: { $gt: 0 }, boardId: this._id, archived: false} );
    return card !== undefined;
  },

  activities() {
    return Activities.find({ boardId: this._id }, { sort: { createdAt: -1 } });
  },

  activeMembers() {
    return _.where(this.members, { isActive: true });
  },

  activeAdmins() {
    return _.where(this.members, { isActive: true, isAdmin: true });
  },

  memberUsers() {
    return Users.find({ _id: { $in: _.pluck(this.members, 'userId') } });
  },

  getLabel(name, color) {
    return _.findWhere(this.labels, { name, color });
  },

  labelIndex(labelId) {
    return _.pluck(this.labels, '_id').indexOf(labelId);
  },

  memberIndex(memberId) {
    return _.pluck(this.members, 'userId').indexOf(memberId);
  },

  hasMember(memberId) {
    return !!_.findWhere(this.members, { userId: memberId, isActive: true });
  },

  hasAdmin(memberId) {
    return !!_.findWhere(this.members, { userId: memberId, isActive: true, isAdmin: true });
  },

  hasCommentOnly(memberId) {
    return !!_.findWhere(this.members, { userId: memberId, isActive: true, isAdmin: false, isCommentOnly: true });
  },

  absoluteUrl() {
    return FlowRouter.url('board', { id: this._id, slug: this.slug });
  },

  colorClass() {
    return `board-color-${this.color}`;
  },

  customFields() {
    return CustomFields.find({ boardId: this._id }, { sort: { name: 1 } });
  },

  // XXX currently mutations return no value so we have an issue when using addLabel in import
  // XXX waiting on https://github.com/mquandalle/meteor-collection-mutations/issues/1 to remove...
  pushLabel(name, color) {
    const _id = Random.id(6);
    Boards.direct.update(this._id, { $push: { labels: { _id, name, color } } });
    return _id;
  },

  searchCards(term) {
    check(term, Match.OneOf(String, null, undefined));

    let query = { boardId: this._id };
    const projection = { limit: 10, sort: { createdAt: -1 } };

    if (term) {
      const regex = new RegExp(term, 'i');

      query = {
        boardId: this._id,
        $or: [
          { title: regex },
          { description: regex },
        ],
      };
    }

    return Cards.find(query, projection);
  },

  cardsInInterval(start, end) {
    return Cards.find({
      $or: [
        {
          startAt: {
            $lte: start,
          }, endAt: {
            $gte: start,
          },
        }, {
          startAt: {
            $lte: end,
          }, endAt: {
            $gte: end,
          },
        }, {
          startAt: {
            $gte: start,
          }, endAt: {
            $lte: end,
          },
        },
      ],
    });
  },

});

