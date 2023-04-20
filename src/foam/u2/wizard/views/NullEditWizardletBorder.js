/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'NullEditWizardletBorder',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.ControllerMode'
  ],

  imports: ['wizardlet'],

  exports: ['controllerMode'],

  messages: [
    { name: 'INSTRUCTION', message: 'This information can not be edited through the UI. Please contact support in order to update this information'}
  ],
  
  css: `
    ^ {
    min-height: 60px;
  
    background-color: $white;
    border: solid 2px blue;
    border-radius: 5px;
  
    padding: 16px;
  
    transition: all 0.2s linear;
    }
  `,
  
  documentation: 'Border for wizardlets that the user is not allowed to edit',

  properties:[
    {
      name: 'title',
      class: 'String',
      expression: function(wizardlet) {
        // console.log(wizardlet?.editBehaviour.title,wizardlet?.title )
        return wizardlet?.capability.editBehaviour.title ||  wizardlet?.title
      }
    },
    {
      name: 'controllerMode',
      value: foam.u2.ControllerMode.VIEW
    }
  ], 
  
  methods: [
    function init() {
      this
        .addClass()
          .start().addClass('h500').add(this.title).end()
          .start().addClass('p').add(this.INSTRUCTION).end()
          .tag('div', null, this.content$)

    }
  ]
  });
    