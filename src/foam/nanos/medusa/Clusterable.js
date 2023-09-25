/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'Clusterable',

  documentation: `Per object instance control over clustering. Consider Sessions, some are to be clustered, others not.`,
  properties: [
    {
      class: 'Boolean',
      name: 'clusterable',
      value: true,
      documentation: 'In a medusa cluster, when false, this entity remains local to the generating server.  Intended for entity such as Alarms, Notifications, Emails allowing a medusa server to report clustering issues.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterableDummy',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'clusterable'
    }
  ]
});
