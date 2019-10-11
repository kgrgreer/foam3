foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'AddFXProvisionPayerPermission',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Rule to add fx.provision.payer permissions to a business after it is onboarded.',

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Permission',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'javax.security.auth.AuthPermission',
    'net.nanopay.model.Business',
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
            DAO localGroupDAO = (DAO) x.get("localGroupDAO");
            Address businessAddress = business.getAddress();
            if ( business.getOnboarded() && null != businessAddress 
                && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
              Permission fxProvisionPermission = new Permission.Builder(x).setId("fx.provision.payer").build();
              String businessGroup = business.getGroup();
              Group group = (Group) localGroupDAO.find(businessGroup.substring(0, businessGroup.length() - 5).concat("employee"));
              if ( null != group && ! group.implies(x, new AuthPermission(fxProvisionPermission.getId())) ) {
                try {
                  group.getPermissions(getX()).add(fxProvisionPermission);  
                } catch(Throwable t) {
                    ((Logger) x.get("logger")).error("Error adding fx.provision.payer permission to business " + business.getId(), t);
                }
              } 
            }
          }
        }, "Rule to add fx.provision.payer permissions to a business after it is onboarded.");
      `
    }
  ]
});
