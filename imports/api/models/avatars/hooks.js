
import { Avatars } from './schema';


Avatars.files.before.insert((userId, doc) => {
  doc.userId = userId;
});
