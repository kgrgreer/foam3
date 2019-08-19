foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UpdateBusinessPermissions',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates business permissions.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
	  'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.logger.Logger',
    'javax.security.auth.AuthPermission',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
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
            DAO groupDAO = (DAO) x.get("groupDAO");
            Address businessAddress = business.getBusinessAddress();
            
            if ( null != businessAddress && null != businessAddress.getCountryId() ) {
              String currencyPermissionString = "currency.read.";
              currencyPermissionString = businessAddress.getCountryId().equals("CA") ? currencyPermissionString + "CAD" : currencyPermissionString + "USD";
              Permission currencyPermission = new Permission.Builder(x).setId(currencyPermissionString).build();
              Group group = business.findGroup(x);
              while ( group != null ) {
                group = (Group) group.findParent(x);
                if ( group != null && group.getId().contains("employee") ) break;
              }

              if ( null != group && ! group.implies(x, new AuthPermission(currencyPermissionString)) ) {
                try {
                  group.getPermissions(x).add(currencyPermission);  
                } catch(Throwable t) {
                    ((Logger) x.get("logger")).error("Error Updating business domestic currency permission.", t);
                } 
              }

              Permission fxProvisionPermission = new Permission.Builder(x).setId("fx.provision.payer").build();
              group = business.findGroup(x);
              if ( null != group && ! group.implies(x, new AuthPermission(fxProvisionPermission.getId())) ) {
                try {
                  group.getPermissions(x).add(fxProvisionPermission);  
                } catch(Throwable t) {
                    ((Logger) x.get("logger")).error("Error adding fx.provision.payer permission to business " + business.getId(), t);
                }
              } 
            }
          }
        }, "Update Business Permissions");
      `
    }
  ]
});
