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
  name: 'AFEXRemoveCurrencyPermissionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Removes currency.read.FX_CURRENCY permissions to a business when AFEXBUsiness is disabled.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'javax.security.auth.AuthPermission',
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

          Logger logger = (Logger) x.get("logger");
          
          if ( ! (obj instanceof AFEXUser) ) {
            return;
          }
          
          AFEXUser afexUser = (AFEXUser) obj;
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          DAO localGroupDAO = (DAO) x.get("localGroupDAO");
          
          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexUser.getUser()));
          if ( null != business ) {
            Address businessAddress = business.getAddress();
            if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
              String permissionString = "currency.read.";
              permissionString = businessAddress.getCountryId().equals("CA") ? permissionString + "USD" : permissionString + "CAD";
              Permission permission = new Permission.Builder(x).setId(permissionString).build();
              Group group = (Group) localGroupDAO.find(business.getGroup());
              while ( group != null ) {
                group = (Group) group.findParent(x);
                if ( group != null && group.getId().endsWith("employee") ) break;
              }
              if ( null != group && group.implies(x, new AuthPermission(permissionString)) ) {
                try {
                  group.getPermissions(x).remove(permission);  
                } catch(Throwable t) {
                    logger.error("Error removing " + permissionString + " from business " + business.getId(), t);
                  }
                } 
              }
            }
        }

      }, "Removes currency.read.FX_CURRENCY permissions to business when AFEXBUsiness is disabled.");
      `
    }
  ]

});
