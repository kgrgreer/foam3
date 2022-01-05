/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.uid',
  name: 'FuidKey',
  plural: 'Fuid Keys',

  ids: [ 'daoName' ],

  properties: [
    {
      class: 'String',
      name: 'daoName'
    },
    {
      class: 'Int',
      name: 'key'
    }
  ]
});
