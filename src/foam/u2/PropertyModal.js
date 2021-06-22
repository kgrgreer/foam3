/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'PropertyModal',
  extends: 'foam.u2.dialog.StyledModal',

  documentation: 'View for attaching a choice to a modal',

  imports: [
    'notify'
  ],

  requires: [
    'foam.u2.ControllerMode',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  messages: [
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete' },
    { name: 'SUCCESS_MSG', message: ' deleted' },
    { name: 'FAIL_MSG', message: 'Failed to delete' },
    { name: 'DEFAULT_TITLE', message: 'Please fill out the following' },
    { name: 'REQUIRED', message: 'Required' },
    { name: 'OPTIONAL', message: 'Optional' }
  ],

  properties: [
    {
      class: 'Function',
      name: 'onExecute'
    },
    {
      name: 'title',
      expression: function(isModalRequired) {
        if ( isModalRequired ) return `${this.DEFAULT_TITLE} (${this.REQUIRED})`;
        return `${this.DEFAULT_TITLE} (${this.OPTIONAL})`;
      }
    },
    {
      class: 'Property',
      name: 'property'
    },
    {
      class: 'Boolean',
      name: 'isModalRequired'
    },
    {
      name: 'propertyData',
      attribute: true
    },
    'data'
  ],

  methods: [
    function addBody() {
      return this.E()
        .startContext({ controllerMode: this.ControllerMode.EDIT })
          .tag(this.SectionedDetailPropertyView, {
            prop: this.property,
            data$: this.data$
          })
        .endContext();
    },
    function addActions() {
      var actions = this.E().startContext({ data: this });
      actions.tag(this.OK, { isDestructive: this.modalStyle == 'DESTRUCTIVE' });
      if ( this.showCancel ) {
        actions.tag(this.CANCEL);
      }
      return actions.endContext();
    }
  ],

  actions: [
    {
      name: 'ok',
      buttonStyle: 'PRIMARY',
      isEnabled: (isModalRequired, propertyData) => {
        if ( ! isModalRequired ) return true;

        return propertyData;
      },
      code: function(X) {
        this.onExecute();
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
