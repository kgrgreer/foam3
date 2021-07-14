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
    { name: 'LARGE', label: 'Large', iconSize: '2em' },
    { name: 'MEDIUM', label: 'Medium', iconSize: '1.5em' },
    { name: 'SMALL', label: 'Small', iconSize: '1em' }
  ]
});
