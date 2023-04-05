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
  
  methods: [
    function init() {
      this
        .addClass()
        // a border that renders actions (pass the actions that we want to see)
          // edit
          // save
          // cancel
          // each button will show based on whether is available
        .tag('div', null, this.content$);
    }
  ],

  actions: [

  ]
  });
  