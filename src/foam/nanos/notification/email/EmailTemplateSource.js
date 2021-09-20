/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateSource',

  properties: [
    {
      class: 'String',
      name: 'sourceClass',
      documentation: 'Source class where email generated',
      tableWidth: 250
    },
    {
      class: 'String',
      name: 'sourceType',
      documentation: 'Source of email generation type - EmailTemplateSourceEnum'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      documentation: 'Whether to determine sending email'
    }
  ]
});
