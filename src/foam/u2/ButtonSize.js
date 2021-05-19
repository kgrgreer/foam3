/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2',
  name: 'ButtonSize',

  properties: ['iconSize'],

  values: [
    { name: 'LARGE', label: 'Large', iconSize: 32 },
    { name: 'MEDIUM', label: 'Medium', iconSize: 24 },
    { name: 'SMALL', label: 'Small', iconSize: 16 }
  ]
});
