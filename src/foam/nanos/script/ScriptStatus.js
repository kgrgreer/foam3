/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.script',
  name: 'ScriptStatus',
  values: [
    {
      name: 'SCHEDULED',
      label: 'Scheduled',
      ordinal: 0,
      color: '$yellow700',
      background: '$yellow200'
    },
    {
      name: 'UNSCHEDULED',
      label: 'Unscheduled',
      ordinal: 1,
      color: '$grey700',
      background: '$grey200',
    },
    {
      name: 'RUNNING',
      label: 'Running',
      ordinal: 2,
      color: '$green500',
      background: '$green50',
    },
    {
      name: 'ERROR',
      label: 'Error',
      ordinal: 3,
      color: '$red500',
      background: '$red700'
    }
  ]
});
