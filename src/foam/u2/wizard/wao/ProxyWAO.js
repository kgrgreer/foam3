/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'ProxyWAO',
  implements: [ 'foam.u2.wizard.wao.WAO' ],
  flags: ['web'],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.u2.wizard.wao.WAO',
      name: 'delegate',
      factory: function() { return foam.u2.wizard.wao.NullWAO.create(); }
    }
  ]
});
