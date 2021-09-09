/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CheckUserCapabilitySpidMismatch',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `
    On userCapabilityJunctionDAO and bareUserCapabilityJunctionDAO Put, check the ucj so that
    if the target Capability has a spid set, it must match the spid of the source User.
    Otherwise, an exception is thrown
  `,

  javaImports: [
    'foam.core.ClientRuntimeException',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil'
  ],

  messages: [
    { name: 'SPID_MISMATCH_ERROR', message: 'Spid mismatch between user and capability.' }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          X systemX = ruler.getX();
          @Override
          public void execute(X x) {
            Logger logger = (Logger) x.get("logger");
            
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            Capability capability = (Capability) ucj.findTargetId(systemX);
            
            if ( SafetyUtil.isEmpty(capability.getSpid()) ) return;

            User user = (User) ucj.findSourceId(systemX);
            if ( ! user.getSpid().equals(capability.getSpid()) ) {
              logger.debug(SPID_MISMATCH_ERROR,
                "user=", user.getId(), "user.spid=", user.getSpid(),
                "capability=", capability.getId(), "capability.spid=", capability.getSpid());
              throw new ClientRuntimeException(SPID_MISMATCH_ERROR);
            }
          }
        }, "check spid mismatch");
      `
    }
  ]
});
