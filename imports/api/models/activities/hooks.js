import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Activities } from './schema';
import { Notifications } from '/imports/notifications/notifications';
import { Integrations } from '/imports/api/models/integrations';


Activities.before.insert((userId, doc) => {
  doc.createdAt = new Date();
});

if (Meteor.isServer) {

  Activities.after.insert((userId, doc) => {
    const activity = Activities._transform(doc);
    let participants = [];
    let watchers = [];
    let title = 'act-activity-notify';
    let board = null;
    const description = `act-${activity.activityType}`;
    const params = {
      activityId: activity._id,
    };
    if (activity.userId) {
      // No need send notification to user of activity
      // participants = _.union(participants, [activity.userId]);
      params.user = activity.user().getName();
      params.userId = activity.userId;
    }
    if (activity.boardId) {
      board = activity.board();
      params.board = board.title;
      title = 'act-withBoardTitle';
      params.url = board.absoluteUrl();
      params.boardId = activity.boardId;
    }
    if (activity.memberId) {
      participants = _.union(participants, [activity.memberId]);
      params.member = activity.member().getName();
    }
    if (activity.listId) {
      const list = activity.list();
      watchers = _.union(watchers, list.watchers || []);
      params.list = list.title;
      params.listId = activity.listId;
    }
    if (activity.oldListId) {
      const oldList = activity.oldList();
      watchers = _.union(watchers, oldList.watchers || []);
      params.oldList = oldList.title;
      params.oldListId = activity.oldListId;
    }
    if (activity.cardId) {
      const card = activity.card();
      participants = _.union(participants, [card.userId], card.members || []);
      watchers = _.union(watchers, card.watchers || []);
      params.card = card.title;
      title = 'act-withCardTitle';
      params.url = card.absoluteUrl();
      params.cardId = activity.cardId;
    }
    if (activity.commentId) {
      const comment = activity.comment();
      params.comment = comment.text;
      params.commentId = comment._id;
    }
    if (activity.attachmentId) {
      const attachment = activity.attachment();
      params.attachment = attachment._id;
    }
    if (activity.checklistId) {
      const checklist = activity.checklist();
      params.checklist = checklist.title;
    }
    if (activity.checklistItemId) {
      const checklistItem = activity.checklistItem();
      params.checklistItem = checklistItem.title;
    }
    if (activity.customFieldId) {
      const customField = activity.customField();
      params.customField = customField.name;
    }
    if (board) {
      const watchingUsers = _.pluck(_.where(board.watchers, {level: 'watching'}), 'userId');
      const trackingUsers = _.pluck(_.where(board.watchers, {level: 'tracking'}), 'userId');
      const mutedUsers = _.pluck(_.where(board.watchers, {level: 'muted'}), 'userId');
      switch(board.getWatchDefault()) {
      case 'muted':
        participants = _.intersection(participants, trackingUsers);
        watchers = _.intersection(watchers, trackingUsers);
        break;
      case 'tracking':
        participants = _.difference(participants, mutedUsers);
        watchers = _.difference(watchers, mutedUsers);
        break;
      }
      watchers = _.union(watchers, watchingUsers || []);
    }

    Notifications.getUsers(participants, watchers).forEach((user) => {
      Notifications.notify(user, title, description, params);
    });

    const integrations = Integrations.find({ boardId: board._id, type: 'outgoing-webhooks', enabled: true, activities: { '$in': [description, 'all'] } }).fetch();
    if (integrations.length > 0) {
      Meteor.call('outgoingWebhooks', integrations, description, params);
    }
  });
}
