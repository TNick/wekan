import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { FS } from 'meteor/cfs:standard-packages';

import { Avatars } from '/imports/api/models/avatars';
import '../userAvatarInitials';
import './changeAvatarPopup.tpl.jade';


export const changeAvatarPopup = BlazeComponent.extendComponent({
  onCreated() {
    this.error = new ReactiveVar('');

    Meteor.subscribe('my-avatars');
  },

  avatarUrlOptions() {
    return {
      auth: false,
      brokenIsFine: true,
    };
  },

  uploadedAvatars() {
    return Avatars.find({userId: Meteor.userId()});
  },

  isSelected() {
    const userProfile = Meteor.user().profile;
    const avatarUrl = userProfile && userProfile.avatarUrl;
    const currentAvatarUrl = this.currentData().url(this.avatarUrlOptions());
    return avatarUrl === currentAvatarUrl;
  },

  noAvatarUrl() {
    const userProfile = Meteor.user().profile;
    const avatarUrl = userProfile && userProfile.avatarUrl;
    return !avatarUrl;
  },

  setAvatar(avatarUrl) {
    Meteor.user().setAvatarUrl(avatarUrl);
  },

  setError(error) {
    this.error.set(error);
  },

  events() {
    return [{
      'click .js-upload-avatar'() {
        this.$('.js-upload-avatar-input').click();
      },
      'change .js-upload-avatar-input'(evt) {
        let file, fileUrl;

        FS.Utility.eachFile(evt, (f) => {
          try {
            file = Avatars.insert(new FS.File(f));
            fileUrl = file.url(this.avatarUrlOptions());
          } catch (e) {
            this.setError('avatar-too-big');
          }
        });

        if (fileUrl) {
          this.setError('');
          const fetchAvatarInterval = window.setInterval(() => {
            $.ajax({
              url: fileUrl,
              success: () => {
                this.setAvatar(file.url(this.avatarUrlOptions()));
                window.clearInterval(fetchAvatarInterval);
              },
            });
          }, 100);
        }
      },
      'click .js-select-avatar'() {
        const avatarUrl = this.currentData().url(this.avatarUrlOptions());
        this.setAvatar(avatarUrl);
      },
      'click .js-select-initials'() {
        this.setAvatar('');
      },
      'click .js-delete-avatar'() {
        Avatars.remove(this.currentData()._id);
      },
    }];
  },
}).register('changeAvatarPopup');
