import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { getSlug } from 'meteor/ongoworks:speakingurl';
import { _ } from 'meteor/underscore';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Activities } from '../activities';
import { Cards } from '../cards';
import { CustomFields } from '../customFields';
import { Lists } from '../lists';
import { Swimlanes } from '../swimlanes';
import { Users } from '../users';

export const Boards = new Mongo.Collection('boards');

Boards.attachSchema(new SimpleSchema({
  title: {
    type: String,
  },
  slug: {
    type: String,
    autoValue() { // eslint-disable-line consistent-return
      // XXX We need to improve slug management. Only the id should be necessary
      // to identify a board in the code.
      // XXX If the board title is updated, the slug should also be updated.
      // In some cases (Chinese and Japanese for instance) the `getSlug` function
      // return an empty string. This causes bugs in our application so we set
      // a default slug in this case.
      if (this.isInsert && !this.isSet) {
        let slug = 'board';
        const title = this.field('title');
        if (title.isSet) {
          slug = getSlug(title.value) || slug;
        }
        return slug;
      }
    },
  },
  archived: {
    type: Boolean,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        return false;
      }
    },
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
  // XXX Inconsistent field naming
  modifiedAt: {
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
  // De-normalized number of users that have starred this board
  stars: {
    type: Number,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert) {
        return 0;
      }
    },
  },
  // De-normalized label system
  'labels': {
    type: [Object],
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        const colors = Boards.simpleSchema()._schema['labels.$.color'].allowedValues;
        const defaultLabelsColors = _.clone(colors).splice(0, 6);
        return defaultLabelsColors.map((color) => ({
          color,
          _id: Random.id(6),
          name: '',
        }));
      }
    },
  },
  'labels.$._id': {
    // We don't specify that this field must be unique in the board because that
    // will cause performance penalties and is not necessary since this field is
    // always set on the server.
    // XXX Actually if we create a new label, the `_id` is set on the client
    // without being overwritten by the server, could it be a problem?
    type: String,
  },
  'labels.$.name': {
    type: String,
    optional: true,
  },
  'labels.$.color': {
    type: String,
    allowedValues: [
      'green', 'yellow', 'orange', 'red', 'purple',
      'blue', 'sky', 'lime', 'pink', 'black',
      'silver', 'peachpuff', 'crimson', 'plum', 'darkgreen',
      'slateblue', 'magenta', 'gold', 'navy', 'gray',
      'saddlebrown', 'paleturquoise', 'mistyrose', 'indigo',
    ],
  },
  // XXX We might want to maintain more informations under the member sub-
  // documents like de-normalized meta-data (the date the member joined the
  // board, the number of contributions, etc.).
  'members': {
    type: [Object],
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        return [{
          userId: this.userId,
          isAdmin: true,
          isActive: true,
          isCommentOnly: false,
        }];
      }
    },
  },
  'members.$.userId': {
    type: String,
  },
  'members.$.isAdmin': {
    type: Boolean,
  },
  'members.$.isActive': {
    type: Boolean,
  },
  'members.$.isCommentOnly': {
    type: Boolean,
  },
  permission: {
    type: String,
    allowedValues: ['public', 'private'],
  },
  color: {
    type: String,
    allowedValues: [
      'belize',
      'nephritis',
      'pomegranate',
      'pumpkin',
      'wisteria',
      'midnight',
    ],
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        return Boards.simpleSchema()._schema.color.allowedValues[0];
      }
    },
  },
  description: {
    type: String,
    optional: true,
  },
}));


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
