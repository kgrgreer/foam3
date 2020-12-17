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
  package: 'net.nanopay.account',
  name: 'CreateDefaultDigitalAccountOnUserCreateRule',

  documentation: 'Creates a default digital account when a user is created.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DigitalAccountService service = (DigitalAccountService) x.get("digitalAccount");
            Subject subject = new Subject.Builder(x).setUser((User)obj).build();
            service.findDefault(x.put("subject", subject), null);
         }
        },"Finding default account");
      `
    }
  ]
});
