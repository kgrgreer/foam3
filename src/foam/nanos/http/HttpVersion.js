/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.http',
  name: 'HttpVersion',

  values: [
    {
      name: 'V1',
      label: 'HTTP/1.1',
      ordinal: 1
    },
    {
      name: 'V2',
      label: 'HTTP/2',
      ordinal: 2
    },
    {
      name: 'V3',
      label: 'HTTP/3',
      ordinal: 3
    }
  ]
});
