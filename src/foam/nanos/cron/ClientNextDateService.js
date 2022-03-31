/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'ClientNextDateService',

  implements: [
    'foam.nanos.cron.NextDateService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.cron.NextDateService',
      name: 'delegate'
    }
  ]
});
