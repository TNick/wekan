import { Meteor } from 'meteor/meteor';
import { UnsavedEditCollection } from '/imports/api/models/unsavedEditCollection';

Meteor.publish('unsaved-edits', function() {
  return UnsavedEditCollection.find({
    userId: this.userId,
  });
});
