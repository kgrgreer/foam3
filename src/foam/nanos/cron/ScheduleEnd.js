/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.cron',
  name: 'ScheduleEnd',

  values: [
    { name: 'NEVER', label: 'Never' },
    { name: 'ON',    label: 'On' },
    { name: 'AFTER', label: 'After' }
  ]
});
