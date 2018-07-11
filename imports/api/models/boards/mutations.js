import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Boards } from './schema';


Boards.mutations({
  archive() {
    return { $set: { archived: true } };
  },

  restore() {
    return { $set: { archived: false } };
  },

  rename(title) {
    return { $set: { title } };
  },

  setDescription(description) {
    return { $set: { description } };
  },

  setColor(color) {
    return { $set: { color } };
  },

  setVisibility(visibility) {
    return { $set: { permission: visibility } };
  },

  addLabel(name, color) {
    // If label with the same name and color already exists we don't want to
    // create another one because they would be indistinguishable in the UI
    // (they would still have different `_id` but that is not exposed to the
    // user).
    if (!this.getLabel(name, color)) {
      const _id = Random.id(6);
      return { $push: { labels: { _id, name, color } } };
    }
    return {};
  },

  editLabel(labelId, name, color) {
    if (!this.getLabel(name, color)) {
      const labelIndex = this.labelIndex(labelId);
      return {
        $set: {
          [`labels.${labelIndex}.name`]: name,
          [`labels.${labelIndex}.color`]: color,
        },
      };
    }
    return {};
  },

  removeLabel(labelId) {
    return { $pull: { labels: { _id: labelId } } };
  },

  changeOwnership(fromId, toId) {
    const memberIndex = this.memberIndex(fromId);
    return {
      $set: {
        [`members.${memberIndex}.userId`]: toId,
      },
    };
  },

  addMember(memberId) {
    const memberIndex = this.memberIndex(memberId);
    if (memberIndex >= 0) {
      return {
        $set: {
          [`members.${memberIndex}.isActive`]: true,
        },
      };
    }

    return {
      $push: {
        members: {
          userId: memberId,
          isAdmin: false,
          isActive: true,
          isCommentOnly: false,
        },
      },
    };
  },

  removeMember(memberId) {
    const memberIndex = this.memberIndex(memberId);

    // we do not allow the only one admin to be removed
    const allowRemove = (!this.members[memberIndex].isAdmin) || (this.activeAdmins().length > 1);
    if (!allowRemove) {
      return {
        $set: {
          [`members.${memberIndex}.isActive`]: true,
        },
      };
    }

    return {
      $set: {
        [`members.${memberIndex}.isActive`]: false,
        [`members.${memberIndex}.isAdmin`]: false,
      },
    };
  },

  setMemberPermission(memberId, isAdmin, isCommentOnly) {
    const memberIndex = this.memberIndex(memberId);

    // do not allow change permission of self
    if (memberId === Meteor.userId()) {
      isAdmin = this.members[memberIndex].isAdmin;
    }

    return {
      $set: {
        [`members.${memberIndex}.isAdmin`]: isAdmin,
        [`members.${memberIndex}.isCommentOnly`]: isCommentOnly,
      },
    };
  },
});
