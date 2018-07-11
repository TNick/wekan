import { CardComments } from './schema';

import { Users } from '/imports/api/models/users';


CardComments.helpers({
  user() {
    return Users.findOne(this.userId);
  },
});
