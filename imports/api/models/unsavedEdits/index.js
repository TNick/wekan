import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


// This collection shouldn't be manipulated directly by instead throw the
// `UnsavedEdits` API on the client.
export const UnsavedEditCollection = new Mongo.Collection('unsaved-edits');

UnsavedEditCollection.attachSchema(new SimpleSchema({
  fieldName: {
    type: String,
  },
  docId: {
    type: String,
  },
  value: {
    type: String,
  },
  userId: {
    type: String,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        return this.userId;
      }
    },
  },
}));
