/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFSink',
  extends: 'foam.box.sf.SF',
  implements: [ 'foam.dao.Sink' ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.HTTPSink',
    'foam.dao.Sink'
  ],

  properties: [
    {
      class: 'String',
      name: 'delegateNspecId',
    },
    {
      class: 'Proxy',
      of: 'foam.dao.Sink',
      name: 'delegate',
      transient: true
    }
  ],

  methods: [
    {
      name: 'put',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
        this.storeAndForward((FObject) obj);
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
        getDelegate().put(entry.getObject(), null);
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
        Sink sink = (Sink) getX().get(getDelegateNspecId());
        if ( sink == null ) throw new RuntimeException("NspecId: " + getDelegateNspecId() + "Not Found!!");
        setDelegate(sink);
      `
    },
    {
      name: 'remove',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFSink do not implement 'remove' method");
      `
    },
    {
      name: 'eof',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFSink do not implement 'remove' method");
      `
    },
    {
      name: 'reset',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFSink do not implement 'remove' method");
      `
    }
  ]
})
