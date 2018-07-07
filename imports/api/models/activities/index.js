import { Mongo } from 'meteor/mongo';

import { Attachments } from '../attachments';
import { Boards } from '../boards';
import { CardComments } from '../cardComments';
import { Cards } from '../cards';
import { ChecklistItems } from '../checklistItems';
import { Checklists } from '../checklists';
import { CustomFields } from '../customFields';
import { Lists } from '../lists';
import { Swimlanes } from '../swimlanes';
import { Users } from '../users';

// Activities don't need a schema because they are always set from the a trusted
// environment - the server - and there is no risk that a user change the logic
// we use with this collection. Moreover using a schema for this collection
// would be difficult (different activities have different fields) and wouldn't
// bring any direct advantage.
//
// XXX The activities API is not so nice and need some functionalities. For
// instance if a user archive a card, and un-archive it a few seconds later we
// should remove both activities assuming it was an error the user decided to
// revert.
export const Activities = new Mongo.Collection('activities');


Activities.helpers({
  board() {
    return Boards.findOne(this.boardId);
  },
  user() {
    return Users.findOne(this.userId);
  },
  member() {
    return Users.findOne(this.memberId);
  },
  list() {
    return Lists.findOne(this.listId);
  },
  swimlane() {
    return Swimlanes.findOne(this.swimlaneId);
  },
  oldList() {
    return Lists.findOne(this.oldListId);
  },
  card() {
    return Cards.findOne(this.cardId);
  },
  comment() {
    return CardComments.findOne(this.commentId);
  },
  attachment() {
    return Attachments.findOne(this.attachmentId);
  },
  checklist() {
    return Checklists.findOne(this.checklistId);
  },
  checklistItem() {
    return ChecklistItems.findOne(this.checklistItemId);
  },
  customField() {
    return CustomFields.findOne(this.customFieldId);
  },
});
