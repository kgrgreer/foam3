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
  name: 'AFEXAddCurrencyPermissionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Adds currency.read.FX_CURRENCY permissions to a business when AFEXBUsiness is created.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'javax.security.auth.AuthPermission',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
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
          Logger logger = (Logger) x.get("logger");

          if ( ! (obj instanceof AFEXUser) ) {
            return;
          }

          AFEXUser afexUser = (AFEXUser) obj;
          DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "afexUserDAO"),
            EQ(ApprovalRequest.OBJ_ID, afexUser.getId())
          ));

          ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
          if ( approval == ApprovalStatus.APPROVED ) {
            DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
            DAO localGroupDAO = (DAO) x.get("localGroupDAO");

            Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexUser.getUser()));
            if ( null != business ) {
              Address businessAddress = business.getAddress();
              if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {

                // TODO check and remove if currency.read permissions still need to be given here and update rule name

                CrunchService crunchService = (CrunchService) x.get("crunchService");
                String afexPaymentMenuCapId = "payment.provider.afex";
                Subject subject = new Subject(business);
                crunchService.updateUserJunction(x, subject, afexPaymentMenuCapId, null, CapabilityJunctionStatus.GRANTED);
                
                String permissionString = "currency.read.";
                permissionString = businessAddress.getCountryId().equals("CA") ? permissionString + "USD" : permissionString + "CAD";
                Permission permission = new Permission.Builder(x).setId(permissionString).build();
                Group group = (Group) localGroupDAO.find(business.getGroup());
                while ( group != null ) {

                  group = (Group) group.findParent(x);
                  if ( group != null && group.getId().endsWith("employee") ) break;
                }
                if ( null != group && ! group.implies(x, new AuthPermission(permissionString)) ) {
                  try {
                    group.getPermissions(x).add(permission);

                    // add permission for USBankAccount strategizer
                    if ( ! group.implies(x, new AuthPermission("strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d")) ) {
                      permission = new Permission.Builder(x).setId("strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d").build();
                      group.getPermissions(x).add(permission);
                    }

                  } catch(Throwable t) {
                    logger.error("Error adding " + permissionString + " to business " + business.getId(), t);
                  }
                }
              }
            }
          }

        }

      }, "Adds currency.read.FX_CURRENCY permissions to business when AFEXBUsiness is created.");
      `
    }
  ]

});
