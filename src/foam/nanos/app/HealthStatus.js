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
    { name: 'DOWN',  label: 'Down',  color: 'gray' },
    { name: 'MAINT', label: 'Maint', color: 'orange' },
    { name: 'UP',     label: 'Up',    color: 'green' },
    { name: 'FAIL',   label: 'Fail',  color: 'red' },
    { name: 'DRAIN', label: 'Drain', color: 'orange' }
  ]
});
