import { Meteor } from 'meteor/meteor';
import { FS } from 'meteor/cfs:base-package';

import { allowIsBoardMember } from '/imports/api/utils';
import { Boards } from '/imports/api/models/boards';


// ----------------------------[     Schema      ]----------------------------

// TODO Enforce a schema for the Attachments CollectionFS

export const Attachments = new FS.Collection('attachments', {
  stores: [

    // XXX Add a new store for cover thumbnails so we don't load big images in
    // the general board view
    new FS.Store.GridFS('attachments', {
      // If the uploaded document is not an image we need to enforce browser
      // download instead of execution. This is particularly important for HTML
      // files that the browser will just execute if we don't serve them with the
      // appropriate `application/octet-stream` MIME header which can lead to user
      // data leaks. I imagine other formats (like PDF) can also be attack vectors.
      // See https://github.com/wekan/wekan/issues/99
      // XXX Should we use `beforeWrite` option of CollectionFS instead of
      // collection-hooks?
      // We should use `beforeWrite`.
      beforeWrite: (fileObj) => {
        if (!fileObj.isImage()) {
          return {
            type: 'application/octet-stream',
          };
        }
        return {};
      },
    }),
  ],
});


// ----------------------------[   Alow / Deny   ]----------------------------

if (Meteor.isServer) {
  Attachments.allow({
    insert(userId, doc) {
      return allowIsBoardMember(userId, Boards.findOne(doc.boardId));
    },
    update(userId, doc) {
      return allowIsBoardMember(userId, Boards.findOne(doc.boardId));
    },
    remove(userId, doc) {
      return allowIsBoardMember(userId, Boards.findOne(doc.boardId));
    },
    // We authorize the attachment download either:
    // - if the board is public, everyone (even unconnected) can download it
    // - if the board is private, only board members can download it
    download(userId, doc) {
      const board = Boards.findOne(doc.boardId);
      if (board.isPublic()) {
        return true;
      } else {
        return board.hasMember(userId);
      }
    },

    fetch: ['boardId'],
  });
}