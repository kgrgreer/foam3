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
  name: 'RemoveFXProvisionPayerPermission',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Rule to remove fx.provision.payer permissions from a business after it is not onboarded.',

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
            
            if ( ! business.getOnboarded() && null != businessAddress 
                && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
              Permission fxProvisionPermission = new Permission.Builder(x).setId("fx.provision.payer").build();
              Group group = (Group) localGroupDAO.find(business.getGroup());
              if ( null != group && group.implies(x, new AuthPermission(fxProvisionPermission.getId())) ) {
                try {
                  group.getPermissions(getX()).remove(fxProvisionPermission);  
                } catch(Throwable t) {
                    ((Logger) x.get("logger")).error("Error removing fx.provision.payer permission from business " + business.getId(), t);
                }
              } 
            }
          }
        }, "Rule to remove fx.provision.payer permissions from a business after it is not onboarded.");
      `
    }
  ]
});
