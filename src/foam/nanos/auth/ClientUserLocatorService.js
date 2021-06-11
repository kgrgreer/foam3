/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ClientUserLocatorService',

  implements: [
    'foam.nanos.auth.UserLocatorService'
  ],

  documentation: 'ClientUserLocatorService which uses custom UserLocatorServiceClientBox as delegate',

  requires: [
    'foam.box.HTTPBox',
    'foam.box.UserLocatorServiceClientBox',
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.auth.UserLocatorService',
      factory: function() {
        return this.UserLocatorServiceClientBox.create({ delegate: this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })});
      }
    }
  ]
});
