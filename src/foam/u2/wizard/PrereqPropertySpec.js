/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'PrereqPropertySpec',


  properties: [
    {
      class: 'String',
      name: 'capabilityId'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'path'
    }
  ]
})
