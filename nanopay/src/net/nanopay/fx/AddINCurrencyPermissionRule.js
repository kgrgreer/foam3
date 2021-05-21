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
  package: 'net.nanopay.fx',
  name: 'AddINCurrencyPermissionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Adds IN currency and strategizer permissions to a business when an AFEXBUsiness is created.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'javax.security.auth.AuthPermission',
    'net.nanopay.fx.afex.AFEXUser',
    'net.nanopay.model.Business',
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
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          DAO localGroupDAO = (DAO) x.get("localGroupDAO");
          Logger logger = (Logger) x.get("logger");

          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexUser.getUser()));
          if ( business != null ) {
            Address businessAddress = business.getAddress();
            if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) && businessAddress.getCountryId().equals("CA") ) {
              Group group = (Group) localGroupDAO.find(business.getGroup());
              while ( group != null ) {
                group = (Group) group.findParent(x);
                if ( group != null && group.getId().endsWith("employee") ) break;
              }

              try {
                // add permission for INBankAccount strategizer if country of business is Canada
                if ( null != group && ! group.implies(x, new AuthPermission("strategyreference.read.a5b4d08c-c1c1-d09d-1f2c-12fe04f7cb6b")) && businessAddress.getCountryId().equals("CA") ) {
                  Permission permission = new Permission.Builder(x).setId("strategyreference.read.a5b4d08c-c1c1-d09d-1f2c-12fe04f7cb6b").build();
                  group.getPermissions(x).add(permission);
                  permission = new Permission.Builder(x).setId("currency.read.INR").build();
                  group.getPermissions(x).add(permission);
                }

              } catch(Throwable t) {
                logger.error("Error adding IN permissions to business " + business.getId(), t);
              }
            }
          }
        }
      }, "Adds IN currency and strategizer permissions to business when an AFEXBUsiness is created.");
      `
    }
  ]
});
