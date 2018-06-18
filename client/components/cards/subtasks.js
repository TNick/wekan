BlazeComponent.extendComponent({
  canModifyCard() {
    return Meteor.user() && Meteor.user().isBoardMember() && !Meteor.user().isCommentOnly();
  },
}).register('subtasksDetail');

BlazeComponent.extendComponent({

  addSubtask(event) {
    event.preventDefault();
    const textarea = this.find('textarea.js-add-subtask-item');
    const title = textarea.value.trim();
    const cardId = this.currentData().cardId;
    const card = Cards.findOne(cardId);

    if (title) {
      Subtasks.insert({
        cardId,
        title,
        sort: card.subtasks().count(),
      });
      setTimeout(() => {
        this.$('.add-subtask-item').last().click();
      }, 100);
    }
    textarea.value = '';
    textarea.focus();
  },

  canModifyCard() {
    return Meteor.user() && Meteor.user().isBoardMember() && !Meteor.user().isCommentOnly();
  },

  deleteSubtask() {
    const subtasks = this.currentData().subtasks;
    if (subtasks && subtasks._id) {
      Subtasks.remove(subtasks._id);
      this.toggleDeleteDialog.set(false);
    }
  },

  editSubtask(event) {
    event.preventDefault();
    const textarea = this.find('textarea.js-edit-subtasks-item');
    const title = textarea.value.trim();
    const subtasks = this.currentData().subtasks;
    subtasks.setTitle(title);
  },

  onCreated() {
    this.toggleDeleteDialog = new ReactiveVar(false);
    this.subtasksToDelete = null; //Store data context to pass to subtaskDeleteDialog template
  },

  pressKey(event) {
    //If user press enter key inside a form, submit it
    //Unless the user is also holding down the 'shift' key
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      const $form = $(event.currentTarget).closest('form');
      $form.find('button[type=submit]').click();
    }
  },

  events() {
    const events = {
      'click .toggle-delete-subtasks-dialog'(event) {
        if($(event.target).hasClass('js-delete-subtasks')){
          this.subtasksToDelete = this.currentData().subtasks; //Store data context
        }
        this.toggleDeleteDialog.set(!this.toggleDeleteDialog.get());
      },
    };

    return [{
      ...events,
      'submit .js-add-subtask': this.addSubtask,
      'submit .js-edit-subtasks-title': this.editSubtask,
      'click .confirm-subtasks-delete': this.deleteSubtask,
      keydown: this.pressKey,
    }];
  },
}).register('subtasks');

Template.subtaskDeleteDialog.onCreated(() => {
  const $cardDetails = this.$('.card-details');
  this.scrollState = { position: $cardDetails.scrollTop(), //save current scroll position
    top: false, //required for smooth scroll animation
  };
  //Callback's purpose is to only prevent scrolling after animation is complete
  $cardDetails.animate({ scrollTop: 0 }, 500, () => { this.scrollState.top = true; });

  //Prevent scrolling while dialog is open
  $cardDetails.on('scroll', () => {
    if(this.scrollState.top) { //If it's already in position, keep it there. Otherwise let animation scroll
      $cardDetails.scrollTop(0);
    }
  });
});

Template.subtaskDeleteDialog.onDestroyed(() => {
  const $cardDetails = this.$('.card-details');
  $cardDetails.off('scroll'); //Reactivate scrolling
  $cardDetails.animate( { scrollTop: this.scrollState.position });
});

Template.subtaskItemDetail.helpers({
  canModifyCard() {
    return Meteor.user() && Meteor.user().isBoardMember() && !Meteor.user().isCommentOnly();
  },
});

BlazeComponent.extendComponent({
  // ...
}).register('subtaskItemDetail');