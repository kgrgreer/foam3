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
    This is a styled modal with a title, content/body and a primary and secondary action
  `,

  imports: ['theme?'],

  messages: [{ name: 'CancelLabel', message: 'Cancel' }],

  properties: [
    ['isTop', true],
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'primaryAction',
      documentation: 'The primary action for this modal dialog (Save/Submit/Continue)',
      adapt: (_, a, p) => {
        a.buttonStyle = 'PRIMARY';
        return a;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'secondaryAction',
      documentation: 'The secondary action for this modal dialog (Close/Cancel)',
      adapt: (_, a, p) => {
        a.buttonStyle = 'TERTIARY';
        return a;
      }
    },
    ['showCancel', true]
  ],

  methods: [
    function init() {
      this.SUPER();
      this.sub('action', () => { this.close(); });
    },
    function addActions() {
      var actions = this.E().startContext({ data: this });
      actions.tag(this.primaryAction, { isDestructive: this.modalStyle == 'DESTRUCTIVE' });
      if ( this.showCancel ) {
        actions.tag(this.secondaryAction || this.CANCEL);
      }
      return actions.endContext();
    }
  ],

  actions: [
    {
      name: 'cancel',
      label: this.CANCEL_LABEL,
      buttonStyle: 'TERTIARY',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]

});
