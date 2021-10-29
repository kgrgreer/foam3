/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterableMixin',

  implements: [
    'foam.nanos.medusa.Clusterable'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'clusterable',
      documentation: 'In a medusa cluster, when false, this entity remains local to the generating server.  Intended for entity such as Alarms, Notifications, Emails allowing a medusa server to report clustering issues.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});
