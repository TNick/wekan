import { Presence } from 'meteor/3stack:presence';
import { Session } from 'meteor/session';


// https://github.com/3stack-software/meteor-presence
Presence.configure({
  // We want to track more than just what a user is doing
  // (but instead what they are up to), so we set a custom state function.
  state() {
    return {
      currentBoardId: Session.get('currentBoard'),
    };
  },
});
