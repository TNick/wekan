import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


// Activities don't need a schema because they are always set from the a trusted
// environment - the server - and there is no risk that a user change the logic
// we use with this collection. Moreover using a schema for this collection
// would be difficult (different activities have different fields) and wouldn't
// bring any direct advantage.
//
// XXX The activities API is not so nice and need some functionalities. For
// instance if a user archive a card, and un-archive it a few seconds later we
// should remove both activities assuming it was an error the user decided to
// revert.
export const Activities = new Mongo.Collection('activities');

// ----------------------------[     Various     ]----------------------------

if (Meteor.isServer) {
  // For efficiency create indexes on the date of creation, and on the date of
  // creation in conjunction with the card or board id, as corresponding views
  // are largely used in the App. See #524.
  Meteor.startup(() => {
    Activities._collection._ensureIndex({ createdAt: -1 });
    Activities._collection._ensureIndex({ cardId: 1, createdAt: -1 });
    Activities._collection._ensureIndex({ boardId: 1, createdAt: -1 });
    Activities._collection._ensureIndex({ commentId: 1 }, { partialFilterExpression: { commentId: { $exists: true } } });
    Activities._collection._ensureIndex({ attachmentId: 1 }, { partialFilterExpression: { attachmentId: { $exists: true } } });
    Activities._collection._ensureIndex({ customFieldId: 1 }, { partialFilterExpression: { customFieldId: { $exists: true } } });
  });
}
