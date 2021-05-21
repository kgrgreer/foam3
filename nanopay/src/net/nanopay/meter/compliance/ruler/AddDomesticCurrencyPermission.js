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
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'AddDomesticCurrencyPermission',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Rule to add currency.read.Currency permissions to a business.',

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'javax.security.auth.AuthPermission',
	  'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof Business) ) {
	            return;
            }
            Business business = (Business) obj.fclone();
            DAO localGroupDAO = (DAO) getX().get("localGroupDAO");
            Address businessAddress = business.getAddress();
            
            if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
              String currencyPermissionString = "currency.read.";
              currencyPermissionString = businessAddress.getCountryId().equals("CA") ? currencyPermissionString + "CAD" : currencyPermissionString + "USD";
              Permission currencyPermission = new Permission.Builder(getX()).setId(currencyPermissionString).build();
              Group group = (Group) localGroupDAO.find(business.getGroup());
              while ( group != null ) {
                group = (Group) group.findParent(getX());
                if ( group != null && group.getId().endsWith("employee") ) break;
              }
              if ( null != group && ! group.implies(getX(), new AuthPermission(currencyPermissionString)) ) {
                try {
                  group.getPermissions(getX()).add(currencyPermission);  
                } catch(Throwable t) {
                    ((Logger) getX().get("logger")).error("Error adding " + currencyPermissionString + " permission to business " + business.getId(), t);
                } 
              } 
            }
          }
        }, "Rule to add currency.read.Currency permissions to a business.");
      `
    }
  ]
});
