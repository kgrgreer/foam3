/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.sandbox',
  name: 'AbstractNSpecFactory',
  javaImplements: ['foam.core.XFactory'],
  abstract: true,

  properties: [
    {
      class: 'Object',
      javaType: 'foam.core.X',
      name: 'hostX'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec',
      name: 'nSpec'
    }
  ]
});
