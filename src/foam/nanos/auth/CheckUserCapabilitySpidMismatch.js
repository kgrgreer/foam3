/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
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
