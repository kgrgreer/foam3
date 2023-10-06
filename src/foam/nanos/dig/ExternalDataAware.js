/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.dig',
  name: 'ExternalDataAware',
  documentation: 'Interface for marking an object that contains the externalData map',

  properties: [
    {
      class: 'Map',
      name: 'externalData',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});
