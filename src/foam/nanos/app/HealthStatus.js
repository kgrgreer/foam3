/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.app',
  name: 'HealthStatus',

  documentation: 'Represents typical health status',

  values: [
    { name: 'DOWN',  label: 'down',  color: 'gray' },
    { name: 'MAINT', label: 'maint', color: 'orange' },
    { name: 'UP',     label: 'up',    color: 'green' },
    { name: 'FAIL',   label: 'fail',  color: 'red' },
    { name: 'DRAIN', label: 'drain', color: 'orange' }
  ]
});
