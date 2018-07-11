import { ChecklistItems } from './schema';
import { Checklists } from '/imports/api/models/checklists';


ChecklistItems.mutations({
  setTitle(title) {
    return { $set: { title } };
  },
  toggleItem() {
    return { $set: { isFinished: !this.isFinished } };
  },
  move(checklistId, sortIndex) {
    const cardId = Checklists.findOne(checklistId).cardId;
    const mutatedFields = {
      cardId,
      checklistId,
      sort: sortIndex,
    };

    return {$set: mutatedFields};
  },
});
