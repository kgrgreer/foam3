/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ProxySink',
  implements: [ 'foam.dao.Sink' ],

  documentation: 'Proxy for Sink interface.',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.Sink',
      name: 'delegate',
      factory: function() { return foam.dao.ArraySink.create(); }
    }
  ]
});
