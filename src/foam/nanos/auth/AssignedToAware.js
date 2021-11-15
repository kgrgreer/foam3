/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AssignedToAware',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'assignedTo'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'assignedToGroup'
    }
  ]
});