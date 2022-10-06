/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ActionButtonStyleRefinement',
  refines: 'foam.core.Action',

  properties: [
    // TODO: this breaks Java gen
    // Upgrade buttonStyle property to enum
    // {
    //   class: 'Enum',
    //   of: 'foam.u2.ButtonStyle',
    //   name: 'buttonStyle'
    // }
  ]
});
