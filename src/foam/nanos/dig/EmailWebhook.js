/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.dig',
  name: 'EmailWebhook',
  documentation: 'Interface for marking an object that contains the externalData map',

  properties: [
    {
      name: 'templateId',
      class: 'String'
    },
    {
      name: 'email',
      class: 'String'
    },
    {
      name: 'firstName',
      class: 'String'
    },
    {
      name: 'lastName',
      class: 'String'
    },
    {
      name: 'data',
      class: 'Map'
    }
  ]
});
