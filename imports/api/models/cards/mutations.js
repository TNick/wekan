import { Cards } from './schema';
import { Lists } from '/imports/api/models/lists';

Cards.mutations({
  archive() {
    return {$set: {archived: true}};
  },

  restore() {
    return {$set: {archived: false}};
  },

  setTitle(title) {
    return {$set: {title}};
  },

  setDescription(description) {
    return {$set: {description}};
  },

  setRequestedBy(requestedBy) {
    return {$set: {requestedBy}};
  },

  setAssignedBy(assignedBy) {
    return {$set: {assignedBy}};
  },

  move(swimlaneId, listId, sortIndex) {
    const list = Lists.findOne(listId);
    const mutatedFields = {
      swimlaneId,
      listId,
      boardId: list.boardId,
      sort: sortIndex,
    };

    return {$set: mutatedFields};
  },

  addLabel(labelId) {
    return {$addToSet: {labelIds: labelId}};
  },

  removeLabel(labelId) {
    return {$pull: {labelIds: labelId}};
  },

  toggleLabel(labelId) {
    if (this.labelIds && this.labelIds.indexOf(labelId) > -1) {
      return this.removeLabel(labelId);
    } else {
      return this.addLabel(labelId);
    }
  },

  assignMember(memberId) {
    return {$addToSet: {members: memberId}};
  },

  unassignMember(memberId) {
    return {$pull: {members: memberId}};
  },

  toggleMember(memberId) {
    if (this.members && this.members.indexOf(memberId) > -1) {
      return this.unassignMember(memberId);
    } else {
      return this.assignMember(memberId);
    }
  },

  assignCustomField(customFieldId) {
    return {$addToSet: {customFields: {_id: customFieldId, value: null}}};
  },

  unassignCustomField(customFieldId) {
    return {$pull: {customFields: {_id: customFieldId}}};
  },

  toggleCustomField(customFieldId) {
    if (this.customFields && this.customFieldIndex(customFieldId) > -1) {
      return this.unassignCustomField(customFieldId);
    } else {
      return this.assignCustomField(customFieldId);
    }
  },

  setCustomField(customFieldId, value) {
    // todo
    const index = this.customFieldIndex(customFieldId);
    if (index > -1) {
      const update = {$set: {}};
      update.$set[`customFields.${index}.value`] = value;
      return update;
    }
    // TODO
    // Ignatz 18.05.2018: Return null to silence ESLint. No Idea if that is correct
    return null;
  },

  setCover(coverId) {
    return {$set: {coverId}};
  },

  unsetCover() {
    return {$unset: {coverId: ''}};
  },

  setReceived(receivedAt) {
    return {$set: {receivedAt}};
  },

  unsetReceived() {
    return {$unset: {receivedAt: ''}};
  },

  setStart(startAt) {
    return {$set: {startAt}};
  },

  unsetStart() {
    return {$unset: {startAt: ''}};
  },

  setDue(dueAt) {
    return {$set: {dueAt}};
  },

  unsetDue() {
    return {$unset: {dueAt: ''}};
  },

  setEnd(endAt) {
    return {$set: {endAt}};
  },

  unsetEnd() {
    return {$unset: {endAt: ''}};
  },

  setOvertime(isOvertime) {
    return {$set: {isOvertime}};
  },

  setSpentTime(spentTime) {
    return {$set: {spentTime}};
  },

  unsetSpentTime() {
    return {$unset: {spentTime: '', isOvertime: false}};
  },
});

