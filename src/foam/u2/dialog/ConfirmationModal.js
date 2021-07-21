/*
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'ConfirmationModal',
  extends: 'foam.u2.dialog.StyledModal',
  documentation: `
    Extension of styled modal with a primary and secondary action, mainly to be used for conifrmations and yes/no modals.
    Clicking on any action closes performs the action and closes the dialog
  `,

  imports: ['theme?'],

  messages: [{ name: 'CANCEL_LABEL', message: 'Cancel' }],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'primaryAction',
      documentation: 'The primary action for this modal dialog (Save/Submit/Continue)',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'secondaryAction',
      documentation: `The secondary action for this modal dialog (Close/Cancel)
      can be turned off using the 'showCancel' property`,
    },
    ['showCancel', true],
    'data'
  ],

  methods: [
    function addActions() {
      var actions = this.E().startContext({ data: this });
      actions.tag(this.CONFIRM, { label: this.primaryAction.label, isDestructive: this.modalStyle == 'DESTRUCTIVE' });
      if ( this.showCancel ) {
        actions.tag(this.CANCEL, { label: this.secondaryAction ? this.secondaryAction.label : this.CANCEL_LABEL });
      }
      return actions.endContext();
    }
  ],

  actions: [
    {
      name: 'confirm',
      buttonStyle: 'PRIMARY',
      code: function(X) {
        this.primaryAction && this.primaryAction.maybeCall(X, this.data);
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      buttonStyle: 'TERTIARY',
      code: function(X) {
        this.secondaryAction && this.secondaryAction.maybeCall(X, this.data);
        X.closeDialog();
      }
    }
  ]

});
