/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.cron',
  name: 'SchedulableObject',

  documentation: 'Object to be scheduled, implements before scheduled put',

  methods: [
    {
      name: 'beforeScheduledPut',
      type: 'FObject',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        }
      ]
    }
  ]
});
