/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'RemoveJunctionsOnUserRemoval',

  documentation: 'Rule to remove any user-capability relationships when a user is removed',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.dao.AbstractSink',
    'foam.core.Detachable',
    'foam.core.FObject'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          if ( !( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) ) {
            return;
          }

          // not possible to removeAll() because UCJ is lifecycle aware
          // NOTE: put to bareUserCapabilityJunctionDAO to prevent rules on
          // userCapabilityJunctionDAO from firing which could invoke sudo-ing
          // as the deleted user then fails.
          DAO dao = (DAO) x.get("bareUserCapabilityJunctionDAO");
          dao.where(EQ(UserCapabilityJunction.SOURCE_ID, ((User) obj).getId())).select( new AbstractSink() {
            public void put(Object o, Detachable d) {
              UserCapabilityJunction ucj = (UserCapabilityJunction) ( (FObject)o ).fclone();
              ucj.setLifecycleState(LifecycleState.DELETED);
              dao.put(ucj);
            }
          });
        }
      }, "Remove Junctions On User Removal");
      `
    }
  ]
});
