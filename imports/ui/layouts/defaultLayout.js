import { Template } from 'meteor/templating-runtime';

import { Modal } from '/imports/ui/components/utils/modal';
import '/imports/ui/components/common/header';
import '/imports/ui/components/common/head';
import './defaultLayout.tpl.jade';
import './defaultLayout.styl';

Template.defaultLayout.events({
  'click .js-close-modal': () => {
    Modal.close();
  },
});
