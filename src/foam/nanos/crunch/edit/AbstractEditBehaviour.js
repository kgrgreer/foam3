/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.edit',
  name: 'AbstractEditBehaviour',
  implements: ['foam.nanos.crunch.edit.EditBehaviour'],
  abstract: true,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'wizardletBorder',
      flags: ['web'],
      factory: function(){
        return 'foam.u2.wizard.views.NullEditWizardletBorder'
      }
    },
    {
      name: 'title',
      class: 'String',
      documentation: 'wizardlet title used by edit wizards'
    }
  ]
});
