import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Users } from '/imports/api/models/users';

export const AccountSettings = new Mongo.Collection('accountSettings');

// ----------------------------[     Schema      ]----------------------------

AccountSettings.attachSchema(new SimpleSchema({
  _id: {
    type: String,
  },
  booleanValue: {
    type: Boolean,
    optional: true,
  },
  sort: {
    type: Number,
    decimal: true,
  },
}));

// ----------------------------[   Alow / Deny   ]----------------------------

AccountSettings.allow({
  update(userId) {
    const user = Users.findOne(userId);
    return user && user.isAdmin;
  },
});

// ----------------------------[     Various     ]----------------------------

if (Meteor.isServer) {
  Meteor.startup(() => {
    AccountSettings.upsert({_id: 'accounts-allowEmailChange'}, {
      $setOnInsert: {
        booleanValue: false,
        sort: 0,
      },
    });
    AccountSettings.upsert({_id: 'accounts-allowUserNameChange'}, {
      $setOnInsert: {
        booleanValue: false,
        sort: 1,
      },
    });
  });
}
