/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ActionReference',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'action'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      name: 'data'
    }
  ]
});