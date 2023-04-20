/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'PermissiveEditWizardletBorder',
  extends: 'foam.u2.wizard.views.NullEditWizardletBorder',
  imports: ['wizardlet'],

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
  
  documentation: 'Border for wizardlets that the user is allowed to edit',
  
  properties:[
    {
      name: "editing",
      class: "Boolean"
    },
    // {
    //   name: 'title',
    //   class: 'String',
    //   expression: function(wizardlet) {
    //     return wizardlet?.capability.editBehaviour.title
    //   }
    // }
  ],

  methods: [
    function init() {
      this.__subContext__.controllerMode$.sub(() => { console.log(this.__subContext__.controllerMode, 'PermissiveEditWizardletBorder')});

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
      isAvailable: function(editing) {
        return editing;
      },
      code: async function () {
       try {
        await this.wizardlet.save()
        this.editing = false;
        this.controllerMode = foam.u2.ControllerMode.VIEW
        // will be changed to changing controller mode - "editing" will be changed to controlloer 
          // editing false = View
          // editing true = Edit 
        console.log("you saved your data")
       } catch (e) {
        console.log("Your edits could not be saved")
       }
      }
    },
    {
      name: 'Cancel',
      label: 'Cancel',
      buttonStyle: 'PRIMARY',
      isAvailable: function(editing) {
        return editing;
      },
      code: function() {
        
        this.editing = false;
        this.controllerMode = foam.u2.ControllerMode.VIEW
      }
    }
  ]
  });
  