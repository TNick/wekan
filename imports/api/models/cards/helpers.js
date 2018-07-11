import { _ } from 'meteor/underscore';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Cards } from './schema';
import { Lists } from '/imports/api/models/lists';
import { Boards } from '/imports/api/models/boards';
import { Users } from '/imports/api/models/users';
import { Activities } from '/imports/api/models/activities';
import { Attachments } from '/imports/api/models/attachments';
import { CardComments } from '/imports/api/models/cardComments';
import { Checklists } from '/imports/api/models/checklists';
import { CustomFields } from '/imports/api/models/customFields';


Cards.helpers({
  list() {
    return Lists.findOne(this.listId);
  },

  board() {
    return Boards.findOne(this.boardId);
  },

  labels() {
    const boardLabels = this.board().labels;
    const cardLabels = _.filter(boardLabels, (label) => {
      return _.contains(this.labelIds, label._id);
    });
    return cardLabels;
  },

  hasLabel(labelId) {
    return _.contains(this.labelIds, labelId);
  },

  user() {
    return Users.findOne(this.userId);
  },

  isAssigned(memberId) {
    return _.contains(this.members, memberId);
  },

  activities() {
    return Activities.find({cardId: this._id}, {sort: {createdAt: -1}});
  },

  comments() {
    return CardComments.find({cardId: this._id}, {sort: {createdAt: -1}});
  },

  attachments() {
    return Attachments.find({cardId: this._id}, {sort: {uploadedAt: -1}});
  },

  cover() {
    const cover = Attachments.findOne(this.coverId);
    // if we return a cover before it is fully stored, we will get errors when we try to display it
    // todo XXX we could return a default "upload pending" image in the meantime?
    return cover && cover.url() && cover;
  },

  checklists() {
    return Checklists.find({cardId: this._id}, {sort: { sort: 1 } });
  },

  checklistItemCount() {
    const checklists = this.checklists().fetch();
    return checklists.map((checklist) => {
      return checklist.itemCount();
    }).reduce((prev, next) => {
      return prev + next;
    }, 0);
  },

  checklistFinishedCount() {
    const checklists = this.checklists().fetch();
    return checklists.map((checklist) => {
      return checklist.finishedCount();
    }).reduce((prev, next) => {
      return prev + next;
    }, 0);
  },

  checklistFinished() {
    return this.hasChecklist() && this.checklistItemCount() === this.checklistFinishedCount();
  },

  hasChecklist() {
    return this.checklistItemCount() !== 0;
  },

  customFieldIndex(customFieldId) {
    return _.pluck(this.customFields, '_id').indexOf(customFieldId);
  },

  // customFields with definitions
  customFieldsWD() {

    // get all definitions
    const definitions = CustomFields.find({
      boardId: this.boardId,
    }).fetch();

    // match right definition to each field
    if (!this.customFields) return [];
    return this.customFields.map((customField) => {
      const definition = definitions.find((definition) => {
        return definition._id === customField._id;
      });
      //search for "True Value" which is for DropDowns other then the Value (which is the id)
      let trueValue = customField.value;
      if (definition.settings.dropdownItems && definition.settings.dropdownItems.length > 0)
      {
        for (let i = 0; i < definition.settings.dropdownItems.length; i++)
        {
          if (definition.settings.dropdownItems[i]._id === customField.value)
          {
            trueValue = definition.settings.dropdownItems[i].name;
          }
        }
      }
      return {
        _id: customField._id,
        value: customField.value,
        trueValue,
        definition,
      };
    });

  },

  absoluteUrl() {
    const board = this.board();
    return FlowRouter.url('card', {
      boardId: board._id,
      slug: board.slug,
      cardId: this._id,
    });
  },

  canBeRestored() {
    const list = Lists.findOne({_id: this.listId});
    if(!list.getWipLimit('soft') && list.getWipLimit('enabled') && list.getWipLimit('value') === list.cards().count()){
      return false;
    }
    return true;
  },
});
