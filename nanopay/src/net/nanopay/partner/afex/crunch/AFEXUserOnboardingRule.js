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
  package: 'net.nanopay.partner.afex.crunch',
  name: 'AFEXUserOnboardingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Onboards user to AFEX if onboarding ucj is passed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.fx.afex.AFEXServiceProvider'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            User user = (User) ucj.findSourceId(x);
            if ( user == null || ! user.getClass().equals(foam.nanos.auth.User.class) ) return;

            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            afexServiceProvider.onboardUser(user);
          }
        }, "Onboards user to AFEX after final AFEX onboarding ucj is granted.");
      `
    }
  ]
});
