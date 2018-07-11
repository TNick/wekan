
import { InvitationCodes } from './schema';
import { Users } from '/imports/api/models/users';


InvitationCodes.helpers({
  author(){
    return Users.findOne(this.authorId);
  },
});
