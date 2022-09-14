/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.sandbox',
  name: 'Sandbox',

  implements: [
    'foam.core.ContextAware',
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.core.EmptyX',
    'foam.core.FObject',
    'foam.core.ProxyX',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.boot.NSpec',
    'java.util.HashSet'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.sandbox.NSpecFactoryOption',
      name: 'factoryOptions'
    },
    {
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'X',
      name: 'sandboxRootX',
      javaFactory: `
        var host_ = getX();
        var root_ = (X) new ProxyX();
        var serviceDAO_ = (DAO) host_.get("nSpecDAO");

        var services =
          ((ArraySink) serviceDAO_.select(new ArraySink())).getArray();

        for ( Object obj : services ) {
          var nSpec = (NSpec) obj;
          for ( var option : getFactoryOptions() ) {
            var factory = option.maybeGetFactory(host_, nSpec);
            if ( factory == null ) continue;
            root_ = root_.putFactory(nSpec.getName(), factory);
            break;
          }
        }

        return root_;
      `
    }
  ]
});
