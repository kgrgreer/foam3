/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ViewPropertyConfig',

  documentation: 'Configure property order and visibility',

  properties: [
    {
      class: 'String',
      name: 'propertyName'
    },
    {
      class: 'Int',
      name: 'order'
    },
    {
      class: 'foam.u2.DisplayMode',
      name: 'visibility'
    }
  ]
});
