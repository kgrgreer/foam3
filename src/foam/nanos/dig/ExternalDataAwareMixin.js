/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'ExternalDataAwareMixin',

  implements: [
    'foam.nanos.dig.ExternalDataAware'
  ],

  properties: [
    {
      class: 'Map',
      name: 'externalData',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});
