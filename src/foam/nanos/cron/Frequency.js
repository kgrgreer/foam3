/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.cron',
  name: 'Frequency',

  values: [
    { name: 'DAY',   label: 'Day' },
    { name: 'WEEK',  label: 'Week' },
    { name: 'MONTH', label: 'Month' },
    { name: 'YEAR',  label: 'Year' }
  ]
});
