import { CustomFields } from './schema';
import { Activities } from '/imports/api/models/activities';


// TODO not sure if we need this?
//CustomFields.hookOptions.after.update = { fetchPrevious: false };

export function customFieldCreation(userId, doc){
  Activities.insert({
    userId,
    activityType: 'createCustomField',
    boardId: doc.boardId,
    customFieldId: doc._id,
  });
}

CustomFields.after.insert((userId, doc) => {
  customFieldCreation(userId, doc);
});

CustomFields.after.remove((userId, doc) => {
  Activities.remove({
    customFieldId: doc._id,
  });
});
