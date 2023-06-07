/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.INTERFACE({
  package: 'foam.u2',
  name: 'Progressable',
  documentation: '',
  properties: [
    {
      class: 'Int',
      name: 'progressMax'
    },
    {
      class: 'Int',
      name: 'progressValue'
    }
  ]
});
