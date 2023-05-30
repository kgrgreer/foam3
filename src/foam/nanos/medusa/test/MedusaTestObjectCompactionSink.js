/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.test',
  name: 'MedusaTestObjectCompactionSink',
  extends: 'foam.dao.ProxySink',
  implements: ['foam.core.ContextAware'],

  methos: [
    {
      name: 'put',
      args: 'Any obj, foam.core.Detachable sub',
      javaCode: `
      if ( ((MedusaTestObject) obj).getId().hashCode() % 2 == 0) {
        getDelegate().put(obj, sub);
      } else {
        ((Logger) getX().get("logger")).info("MedusaTestObjectCompactionSink,discard",((MedusaTestObject) obj).getId());
      }
      `
    }
  ]
});
