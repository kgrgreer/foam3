/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'PermissiveEditWizardletBorder',
  extends: 'foam.u2.wizard.views.NullEditWizardletBorder',
  documentation: 'Border for wizardlets that the user is allowed to edit',

  import: ['ctrl'],
  
  properties: [
    {
      class: 'FObjectProperty',
      name: 'oldData'
    }
  ],

  messages: [
    {
      name: 'SAVE_FAILED',
      message: 'Your information was not saved. Please try again.'
    }
  ],

  css: `
    ^ {
    min-height: 60px;
  
    background-color: $white;
    border: solid 2px red;
    border-radius: 5px;
  
    padding: 16px;
  
    transition: all 0.2s linear;
    }
  `,
  
  methods: [
    function init() {
      // set in init as factories are lazy
      this.wizardlet.loadEvent.sub(() => {
        this.oldData = this.wizardlet.data.clone()
      })

      this
        .addClass()
          .startContext({data: this})
            .start().addClass('h500').add(this.title).end()
            .add(this.EDIT, ' ', this.SAVE, ' ', this.CANCEL)
          .endContext()
        .tag('div', null, this.content$);
    }
  ],

  actions: [
    {
      name: 'Edit',
      label: 'Edit',
      buttonStyle: 'PRIMARY',
      isAvailable: function(controllerMode) {
        return this.controllerMode !== foam.u2.ControllerMode.EDIT
      },
      code: function() {
        this.controllerMode = foam.u2.ControllerMode.EDIT
      }
    },
    {
      name: 'Save',
      label: 'Save',
      buttonStyle: 'PRIMARY',
      isAvailable: function(controllerMode) {
        return this.controllerMode === foam.u2.ControllerMode.EDIT
      },
      code: async function () {      
       try {
        await this.wizardlet.save()
        this.ctrl.reloadClient()
        this.controllerMode = foam.u2.ControllerMode.VIEW
       } catch (e) {
        alert(this.SAVE_FAILED)
       }
      }
    },
    {
      name: 'Cancel',
      label: 'Cancel',
      buttonStyle: 'PRIMARY',
      isAvailable: function(controllerMode) {
        return this.controllerMode === foam.u2.ControllerMode.EDIT
      },
      code: function() {
        debugger
        this.wizardlet.data = this.oldData
        this.controllerMode = foam.u2.ControllerMode.VIEW
      }
    }
  ]
  });
  