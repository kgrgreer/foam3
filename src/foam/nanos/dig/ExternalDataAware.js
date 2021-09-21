/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.dig',
  name: 'ExternalDataAware',
  documentation: 'Interface for marking an object that contains the externalData map',

  methods: [
    {
      name: 'getExternalData',
      type: 'java.util.Map'
    },
    {
      name: 'setExternalData',
      type: 'Void',
      args: [
        {
          name: 'val',
          type: 'java.util.Map'
        }
      ]
    },
    {
      name: 'clearExternalData',
      type: 'Void'
    }
  ]
});
