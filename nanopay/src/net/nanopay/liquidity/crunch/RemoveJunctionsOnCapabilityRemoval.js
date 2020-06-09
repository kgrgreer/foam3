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
    package: 'net.nanopay.liquidity.crunch',
    name: 'RemoveJunctionsOnCapabilityRemoval',
  
    documentation: 'Rule to remove any user-capability relationships when a capability is removed',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    javaImports: [
      'foam.dao.DAO',
      'foam.nanos.crunch.UserCapabilityJunction',
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.crunch.Capability',
      'static foam.mlang.MLang.*',
      'foam.nanos.auth.LifecycleAware',
      'java.util.List',
      'foam.dao.ArraySink'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) {
              DAO dao = (DAO) x.get("userCapabilityJunctionDAO");
              dao.where(EQ(UserCapabilityJunction.TARGET_ID, ((Capability) obj).getId())).removeAll();
            }
          }
        }, "Remove Junctions On Capability Removal");
        `
      }
    ]
  });