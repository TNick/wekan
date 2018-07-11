import { ChecklistItems } from './schema';

import { Activities } from '/imports/api/models/activities';
import { Cards } from '/imports/api/models/cards';


function itemCreation(userId, doc) {
  const card = Cards.findOne(doc.cardId);
  const boardId = card.boardId;
  Activities.insert({
    userId,
    activityType: 'addChecklistItem',
    cardId: doc.cardId,
    boardId,
    checklistId: doc.checklistId,
    checklistItemId: doc._id,
  });
}

function itemRemover(userId, doc) {
  Activities.remove({
    checklistItemId: doc._id,
  });
}

ChecklistItems.after.insert((userId, doc) => {
  itemCreation(userId, doc);
});

ChecklistItems.after.remove((userId, doc) => {
  itemRemover(userId, doc);
});
