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
  name: 'RequestSigningOfficersCompliance',

  documentation: 'Marks signing officers of a business as compliance requested.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        business.getSigningOfficers(x).getDAO()
          .select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              
              agency.submit(x, new ContextAgent() {
                @Override
                public void execute(X x) {
                  DAO localUserDAO = (DAO) x.get("localUserDAO");
                  User signingOfficer = (User) localUserDAO.find(obj).fclone();

                  // User.compliance is a permissioned property thus we need
                  // to use localUserDAO when saving change to the property.
                  if ( signingOfficer.getCompliance() != ComplianceStatus.PASSED ) {
                    signingOfficer.setCompliance(ComplianceStatus.REQUESTED);
                    localUserDAO.inX(x).put(signingOfficer);
                  }
                }
              }, "Request Signing Officers Compliance");
            }
          });
      `
    }
  ]
});
