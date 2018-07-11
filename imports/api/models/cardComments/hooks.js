import { CardComments } from './schema';

import { Activities } from '/imports/api/models/activities';


CardComments.hookOptions.after.update = { fetchPrevious: false };

export function commentCreation(userId, doc){
  Activities.insert({
    userId,
    activityType: 'addComment',
    boardId: doc.boardId,
    cardId: doc.cardId,
    commentId: doc._id,
  });
}

CardComments.after.insert((userId, doc) => {
  commentCreation(userId, doc);
});

CardComments.after.remove((userId, doc) => {
  const activity = Activities.findOne({ commentId: doc._id });
  if (activity) {
    Activities.remove(activity._id);
  }
});
