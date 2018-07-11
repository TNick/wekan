import { _ } from 'meteor/underscore';

import { Cards } from './schema';
import { Activities } from '/imports/api/models/activities';
import { Checklists } from '/imports/api/models/checklists';
import { CardComments } from '/imports/api/models/cardComments';
import { Attachments } from '/imports/api/models/attachments';


function cardMembers(userId, doc, fieldNames, modifier) {
  if (!_.contains(fieldNames, 'members'))
    return;
  let memberId;
  // Say hello to the new member
  if (modifier.$addToSet && modifier.$addToSet.members) {
    memberId = modifier.$addToSet.members;
    if (!_.contains(doc.members, memberId)) {
      Activities.insert({
        userId,
        memberId,
        activityType: 'joinMember',
        boardId: doc.boardId,
        cardId: doc._id,
      });
    }
  }

  // Say goodbye to the former member
  if (modifier.$pull && modifier.$pull.members) {
    memberId = modifier.$pull.members;
    // Check that the former member is member of the card
    if (_.contains(doc.members, memberId)) {
      Activities.insert({
        userId,
        memberId,
        activityType: 'unjoinMember',
        boardId: doc.boardId,
        cardId: doc._id,
      });
    }
  }
}

export function cardMove(userId, doc, fieldNames, oldListId) {
  if (_.contains(fieldNames, 'listId') && doc.listId !== oldListId) {
    Activities.insert({
      userId,
      oldListId,
      activityType: 'moveCard',
      listId: doc.listId,
      boardId: doc.boardId,
      cardId: doc._id,
    });
  }
}

function cardState(userId, doc, fieldNames) {
  if (_.contains(fieldNames, 'archived')) {
    if (doc.archived) {
      Activities.insert({
        userId,
        activityType: 'archivedCard',
        boardId: doc.boardId,
        listId: doc.listId,
        cardId: doc._id,
      });
    } else {
      Activities.insert({
        userId,
        activityType: 'restoredCard',
        boardId: doc.boardId,
        listId: doc.listId,
        cardId: doc._id,
      });
    }
  }
}

function cardCreation(userId, doc) {
  Activities.insert({
    userId,
    activityType: 'createCard',
    boardId: doc.boardId,
    listId: doc.listId,
    cardId: doc._id,
  });
}

function cardRemover(userId, doc) {
  Activities.remove({
    cardId: doc._id,
  });
  Checklists.remove({
    cardId: doc._id,
  });
  CardComments.remove({
    cardId: doc._id,
  });
  Attachments.remove({
    cardId: doc._id,
  });
}

Cards.after.insert((userId, doc) => {
  cardCreation(userId, doc);
});

// New activity for card (un)archivage
Cards.after.update((userId, doc, fieldNames) => {
  cardState(userId, doc, fieldNames);
});

//New activity for card moves
Cards.after.update(function (userId, doc, fieldNames) {
  const oldListId = this.previous.listId;
  cardMove(userId, doc, fieldNames, oldListId);
});

// Add a new activity if we add or remove a member to the card
Cards.before.update((userId, doc, fieldNames, modifier) => {
  cardMembers(userId, doc, fieldNames, modifier);
});

// Remove all activities associated with a card if we remove the card
// Remove also card_comments / checklists / attachments
Cards.after.remove((userId, doc) => {
  cardRemover(userId, doc);
});
