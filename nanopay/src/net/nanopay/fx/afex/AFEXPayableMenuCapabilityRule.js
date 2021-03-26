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
  name: 'AFEXPayableMenuCapabilityRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Grants AFEX Payable Menu Capability after Afex business is created and approved.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
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
          var crunchService = (CrunchService) x.get("crunchService");
          Logger logger = (Logger) x.get("logger");

          if ( ! (obj instanceof AFEXBusinessApprovalRequest) ) {
            return;
          }

          AFEXBusinessApprovalRequest request = (AFEXBusinessApprovalRequest) obj.fclone();
          AFEXUser afexUser = (AFEXUser) ((DAO) x.get("afexUserDAO")).find(EQ(AFEXUser.ID, request.getObjId()));
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");

          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexUser.getUser()));
          if ( null != business ) {
            var subject = new Subject(x);
            subject.setUser(business);
            subject.setUser(business);

            var subjectX = x.put("subject", subject);
            String afexPaymentMenuCapId = "1f6b2047-1eef-471d-82e7-d86bdf511375";
            crunchService.updateJunction(subjectX, afexPaymentMenuCapId, null, CapabilityJunctionStatus.GRANTED);
          }
        }

      }, "Grants AFEX Payable Meny Capability after Afex  business is created and approved.");
      `
    }
  ]

});
