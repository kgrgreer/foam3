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
  package: 'net.nanopay.business.ruler',
  name: 'businessCapabilitySetUp',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Set up business capability UCJ`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.dao.ArraySink',
    'java.util.List',
    'static foam.mlang.MLang.EQ',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
          DAO pcjDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
          User user = ((Subject) x.get("subject")).getUser();

          //granted service provider business capability
          UserCapabilityJunction spidBusinessPermissionUcj = new UserCapabilityJunction.Builder(x)
          .setSourceId(ucj.getSourceId())
          .setTargetId(user.getSpid() + "BusinessMenuCapability")
          .setStatus(CapabilityJunctionStatus.GRANTED)
          .build();
          ucjDAO.put(spidBusinessPermissionUcj);
        }
      }, "set up and granted businessMenuCapability");
      `
    }
  ]
});
