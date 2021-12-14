/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'Schedulable',
  mixins: [
    'foam.nanos.auth.CreatedAwareMixin',
    'foam.nanos.auth.CreatedByAwareMixin'
  ],

  implements: [
    'foam.nanos.auth.ServiceProviderAware',
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'FObjectProperty',
      name: 'schedule',
      of: 'foam.nanos.cron.Schedule',
      view: {
        class: 'foam.u2.view.FObjectView',
        of: 'foam.nanos.cron.GenericIntervalSchedule'
      }
    },
    {
      class: 'FObjectProperty',
      of: 'FObject',
      name: 'objectToSchedule'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      section: 'basicInfo',
      value: foam.nanos.auth.ServiceProviderAware.GLOBAL_SPID,
      documentation: 'Service Provider Id of the rule. Default to ServiceProviderAware.GLOBAL_SPID for rule applicable to all service providers.'
    }
  ]
 });
