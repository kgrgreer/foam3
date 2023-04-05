/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.u2.wizard.wizardflow',
    name: 'RemoveWizardlet',
    // Conceptually AddWizardlet and EditWizardlet both extend an abstract,
    // but that's unnecessary since there are only two of these.
      
    properties: [
      {
        class: 'String',
        name: 'wizardletId'
      }
    ],
  
    methods: [
      function execute(x) {
        x = x || this.__context__;
       let index = x.wizardlets.findIndex( w => w.id == this.wizardletId);
       x.wizardlets.splice(index, 1);
       return x
      }
    ]
  })
  