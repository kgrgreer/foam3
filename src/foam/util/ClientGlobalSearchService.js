/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'ClientGlobalSearchService',

  implements: [ 'foam.util.GlobalSearchService' ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      of: 'foam.util.GlobalSearchService',
      name: 'delegate',
      factory: function() {
        return this.SessionClientBox.create({ delegate: this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })});
      }
    }
  ]
});
