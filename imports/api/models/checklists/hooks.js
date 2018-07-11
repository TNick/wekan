import { Checklists } from './schema';
import { Activities } from '/imports/api/models/activities';
import { Cards } from '/imports/api/models/cards';


Checklists.before.insert((userId, doc) => {
  doc.createdAt = new Date();
  if (!doc.userId) {
    doc.userId = userId;
  }
});

Checklists.after.insert((userId, doc) => {
  Activities.insert({
    userId,
    activityType: 'addChecklist',
    cardId: doc.cardId,
    boardId: Cards.findOne(doc.cardId).boardId,
    checklistId: doc._id,
  });
});

Checklists.before.remove((userId, doc) => {
  const activities = Activities.find({ checklistId: doc._id });
  if (activities) {
    activities.forEach((activity) => {
      Activities.remove(activity._id);
    });
  }
});
