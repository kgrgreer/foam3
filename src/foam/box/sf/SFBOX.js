/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFBOX',
  extends: 'foam.box.sf.SF',
  implements: [ 'foam.box.Box' ],

  javaImports: [
    'foam.core.FObject',
    'foam.box.Box',
    'foam.box.Message'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'delegateNspecId',
    },
    {
      class: 'Proxy',
      of: 'foam.box.Box',
      name: 'delegate',
      transient: true
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
        this.storeAndForward((FObject) msg);
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
        getDelegate().send((Message) entry.getObject());
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
        Box box = (Box) getX().get(getDelegateNspecId());
        if (  box == null ) throw new RuntimeException("NspecId: " + getDelegateNspecId() + "Not Found!!");
        setDelegate(box);
      `
    },
  ]
});