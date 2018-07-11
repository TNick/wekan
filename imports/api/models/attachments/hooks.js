
import { Meteor } from 'meteor/meteor';

import { Activities } from '/imports/api/models/activities';
import { Attachments } from './schema';


if (Meteor.isServer) {
  Attachments.files.after.insert((userId, doc) => {
    // If the attachment doesn't have a source field
    // or its source is different than import
    if (!doc.source || doc.source !== 'import') {
      // Add activity about adding the attachment
      Activities.insert({
        userId,
        type: 'card',
        activityType: 'addAttachment',
        attachmentId: doc._id,
        boardId: doc.boardId,
        cardId: doc.cardId,
      });
    } else {
      // Don't add activity about adding the attachment as the activity
      // be imported and delete source field
      Attachments.update({
        _id: doc._id,
      }, {
        $unset: {
          source: '',
        },
      });
    }
  });

  Attachments.files.after.remove((userId, doc) => {
    Activities.remove({
      attachmentId: doc._id,
    });
  });
}
