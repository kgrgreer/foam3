/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateSourceEnum',

  values: [
    {
      name: 'UNDEFINED_SOURCE',
      label: 'Undefined Source',
      ordinal: 0
    },
    {
      name: 'RULE_SOURCE',
      label: 'Rule',
      ordinal: 1
    },
    {
      name: 'CRON_SOURCE',
      label: 'Cron',
      ordinal: 2
    },
    {
      name: 'SERVICE_SOURCE',
      label: 'Service',
      ordinal: 3
    },
    {
      name: 'WEB_AGENT_SOURCE',
      label: 'Web Agent',
      ordinal: 4
    }
  ]
});
