import { Checklists } from './schema';

Checklists.mutations({
  setTitle(title) {
    return { $set: { title } };
  },
});
