/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LifecycleAware',

  properties: [
    {
      class: 'Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: 'PENDING',
      readPermissionRequired: true,
      updatePermissionRequired: true
    }
  ]
});
