/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.google.api.sheets.views.wizardModal',
  name: 'WizardModalSubView',
  extends: 'foam.u2.Controller',

  imports: [
    'wizard',
    'subStack',
    'pushToId',
    'viewData',
    'onComplete',
    'closeDialog'
  ]
});
