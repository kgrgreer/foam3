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
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          var ucj = (UserCapabilityJunction) obj;
          var subject = ucj.getSubject(x);
          var user = subject.getUser();

          var crunchService = (CrunchService) x.get("crunchService");
          crunchService.updateUserJunction(
            ruler.getX(), subject, user.getSpid() + "BusinessMenuCapability",
            null, CapabilityJunctionStatus.GRANTED);
        }
      }, "set up and granted businessMenuCapability");
      `
    }
  ]
});
