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
      name: 'UNDEFINED',
      label: 'Undefined Source',
      ordinal: 0
    },
    {
      name: 'RULE',
      label: 'Rule',
      ordinal: 1
    },
    {
      name: 'CRON',
      label: 'Cron',
      ordinal: 2
    },
    {
      name: 'SERVICE',
      label: 'Service',
      ordinal: 3
    },
    {
      name: 'WEB_AGENT',
      label: 'Web Agent',
      ordinal: 4
    }
  ]
});
