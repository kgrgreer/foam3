foam.CLASS({
  package: 'net.nanopay.ui.wizardModal',
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
