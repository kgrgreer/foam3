/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AssignedToAwareMixin',

  implements: [
    'foam.nanos.auth.AssignedToAware'
  ],

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
