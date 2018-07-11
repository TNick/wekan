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
import { Activities } from './schema';


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
