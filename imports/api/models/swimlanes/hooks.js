import { Swimlanes } from './schema';

import { Activities } from '/imports/api/models/activities';


Swimlanes.hookOptions.after.update = { fetchPrevious: false };

Swimlanes.after.insert((userId, doc) => {
  Activities.insert({
    userId,
    type: 'swimlane',
    activityType: 'createSwimlane',
    boardId: doc.boardId,
    swimlaneId: doc._id,
  });
});

Swimlanes.before.remove((userId, doc) => {
  Activities.insert({
    userId,
    type: 'swimlane',
    activityType: 'removeSwimlane',
    boardId: doc.boardId,
    swimlaneId: doc._id,
    title: doc.title,
  });
});

Swimlanes.after.update((userId, doc) => {
  if (doc.archived) {
    Activities.insert({
      userId,
      type: 'swimlane',
      activityType: 'archivedSwimlane',
      swimlaneId: doc._id,
      boardId: doc.boardId,
    });
  }
});
