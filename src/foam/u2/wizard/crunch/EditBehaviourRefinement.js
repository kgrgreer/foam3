/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.crunch',
  name: 'EditBehaviourRefinement',
  refines: 'foam.nanos.crunch.edit.AbstractEditBehaviour',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'wizardletBorder'
    }
  ]
});
