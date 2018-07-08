import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export const Users = Meteor.users;

// ----------------------------[     Schema      ]----------------------------

Users.attachSchema(new SimpleSchema({
  username: {
    type: String,
    optional: true,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        const name = this.field('profile.fullname');
        if (name.isSet) {
          return name.value.toLowerCase().replace(/\s/g, '');
        }
      }
    },
  },
  emails: {
    type: [Object],
    optional: true,
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  'emails.$.verified': {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert) {
        return new Date();
      } else {
        this.unset();
      }
    },
  },
  profile: {
    type: Object,
    optional: true,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert && !this.isSet) {
        return {
          boardView: 'board-view-lists',
        };
      }
    },
  },
  'profile.avatarUrl': {
    type: String,
    optional: true,
  },
  'profile.emailBuffer': {
    type: [String],
    optional: true,
  },
  'profile.fullname': {
    type: String,
    optional: true,
  },
  'profile.hiddenSystemMessages': {
    type: Boolean,
    optional: true,
  },
  'profile.initials': {
    type: String,
    optional: true,
  },
  'profile.invitedBoards': {
    type: [String],
    optional: true,
  },
  'profile.language': {
    type: String,
    optional: true,
  },
  'profile.notifications': {
    type: [String],
    optional: true,
  },
  'profile.showCardsCountAt': {
    type: Number,
    optional: true,
  },
  'profile.starredBoards': {
    type: [String],
    optional: true,
  },
  'profile.tags': {
    type: [String],
    optional: true,
  },
  'profile.icode': {
    type: String,
    optional: true,
  },
  'profile.boardView': {
    type: String,
    optional: true,
    allowedValues: [
      'board-view-lists',
      'board-view-swimlanes',
      'board-view-cal',
    ],
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  heartbeat: {
    type: Date,
    optional: true,
  },
  isAdmin: {
    type: Boolean,
    optional: true,
  },
  createdThroughApi: {
    type: Boolean,
    optional: true,
  },
  loginDisabled: {
    type: Boolean,
    optional: true,
  },
}));


// ----------------------------[   Alow / Deny   ]----------------------------

/// TODO: remove in favor of methods
Users.allow({
  /**
   * Updating the users table from **client code** is allowed to:
   * - the user itself and
   * - to admin users.
   *
   * This DOES NOT get called on server methods; it is triggered by
   * client code and is implemented using methods.
   */
  update(userId) {
    const user = Users.findOne(userId);
    return user && ((user._id === Meteor.user()._id) || Meteor.user().isAdmin);
  },
});

// ----------------------------[     Various     ]----------------------------

// Search a user in the complete server database by its name or username. This
// is used for instance to add a new user to a board.
const searchInFields = ['username', 'profile.fullname'];
Users.initEasySearch(searchInFields, {
  use: 'mongo-db',
  returnFields: [...searchInFields, 'profile.avatarUrl'],
});

if (Meteor.isServer) {
  // Let mongoDB ensure username unicity
  Meteor.startup(() => {
    Users._collection._ensureIndex({
      username: 1,
    }, {unique: true});
  });
}
