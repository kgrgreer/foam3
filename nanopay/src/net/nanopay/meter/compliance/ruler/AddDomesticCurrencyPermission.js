foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'AddDomesticCurrencyPermission',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Rule to add currency.read.Currency permissions to a business.',

  javaImports: [
    'foam.core.ContextAgent',
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
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof Business) ) {
	            return;
            }
            Business business = (Business) obj.fclone();
            DAO localGroupDAO = (DAO) x.get("localGroupDAO");
            Address businessAddress = business.getBusinessAddress();
            
            if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
              String currencyPermissionString = "currency.read.";
              currencyPermissionString = businessAddress.getCountryId().equals("CA") ? currencyPermissionString + "CAD" : currencyPermissionString + "USD";
              Permission currencyPermission = new Permission.Builder(x).setId(currencyPermissionString).build();
              Group group = (Group) localGroupDAO.find(business.getGroup());
              while ( group != null ) {
                group = (Group) group.findParent(x);
                if ( group != null && group.getId().endsWith("employee") ) break;
              }

              if ( null != group && ! group.implies(x, new AuthPermission(currencyPermissionString)) ) {
                try {
                  group.getPermissions(x).add(currencyPermission);  
                } catch(Throwable t) {
                    ((Logger) x.get("logger")).error("Error adding " + currencyPermissionString + " permission to business " + business.getId(), t);
                } 
              } 
            }
          }
        }, "Rule to add currency.read.Currency permissions to a business.");
      `
    }
  ]
});
