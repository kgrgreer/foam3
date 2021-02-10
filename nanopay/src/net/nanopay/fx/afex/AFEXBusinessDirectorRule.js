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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessDirectorRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to push Business Directors to AFEX after AFEX Business is created.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          if ( ! (obj instanceof AFEXUser) ) {
            return;
          }

          AFEXUser afexUser = (AFEXUser) obj;
          Business business = (Business) ((DAO) x.get("localBusinessDAO")).find(EQ(Business.ID, afexUser.getUser()));
          if ( business != null ) {
            ((AFEXServiceProvider) x.get("afexServiceProvider")).pushBusinessDirectors(business, afexUser.getApiKey());
          }
        }
      }, "Rule to push Business Directors to AFEX after AFEX Business is created.");
      `
    }
  ]

});
