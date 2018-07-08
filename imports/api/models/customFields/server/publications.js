import { Meteor } from 'meteor/meteor';
import { CustomFields } from '/imports/api/models/customFields';

Meteor.publish('customFields', function() {
  return CustomFields.find();
});
