import { FS } from 'meteor/cfs:base-package';

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

