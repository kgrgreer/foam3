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

foam.CLASS({
  package: 'net.nanopay.crunch.compliance',
  name: 'ReputDependenciesOnUCJPut',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `After ucj put, reput non-granted dependent ucjs if the ucj has been granted`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED ) return;

            DAO userCapabilityJunctionDAO = (DAO)  x.get("userCapabilityJunctionDAO");
            DAO prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");

            prerequisiteCapabilityJunctionDAO.where(AND(EQ(CapabilityCapabilityJunction.TARGET_ID, ucj.getTargetId())))
              .select(new AbstractSink() {
                @Override
                public void put(Object obj, Detachable sub) {
                  CapabilityCapabilityJunction ccj = (CapabilityCapabilityJunction) obj;
                  Capability dependent = (Capability) ccj.findSourceId(x);
  
                  UserCapabilityJunction pendingDependency = (UserCapabilityJunction) userCapabilityJunctionDAO.find(
                    AND(
                      EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
                      EQ(UserCapabilityJunction.TARGET_ID, ccj.getSourceId()),
                      NEQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
                    ));
                  if ( pendingDependency != null ) {
                    userCapabilityJunctionDAO.put_(x, pendingDependency);
                  }
                }
              });

          }
        }, "Reput UCJ on prerequisite granted");
      `
    }
  ]
});
