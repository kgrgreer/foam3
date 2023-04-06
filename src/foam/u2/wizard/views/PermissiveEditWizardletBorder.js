/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'PermissiveEditWizardletBorder',
  extends: 'foam.u2.Element',
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
    }
  ],

  methods: [
    function init() {
      this
        .addClass()
          .startContext({data: this})
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
      isAvailable: function(editing) {
        return ! editing;
      },
      code: function() {
        this.editing = true;
      }
    },
    {
      name: 'Save',
      label: 'Save',
      buttonStyle: 'PRIMARY',
      isAvailable: function(editing) {
        return editing;
      },
      // code: save user edits
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
      }
    }
  ]
  });
  