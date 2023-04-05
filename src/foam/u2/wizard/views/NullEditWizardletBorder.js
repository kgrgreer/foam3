/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'NullEditWizardletBorder',
  extends: 'foam.u2.Element',
  
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
  
  methods: [
    function init() {
      this
        .addClass()
        .tag('div', null, this.content$);
    }
  ]
  });
    