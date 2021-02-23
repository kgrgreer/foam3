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
  name: 'RequestBeneficialOwnersCompliance',

  documentation: 'Marks beneficial owners of a business as compliance requested.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        final Business business = (Business) obj;
        DAO beneficialOwnerDAO = business.getBeneficialOwners(x);
        beneficialOwnerDAO.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {

            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                BeneficialOwner owner = (BeneficialOwner) ((BeneficialOwner) obj).fclone();
                owner.setCompliance(ComplianceStatus.REQUESTED);

                DAO beneficialOwnerDAO = (DAO) business.getBeneficialOwners(x);
                beneficialOwnerDAO.put(owner);
              }
            }, "Request Beneficial Owners Compliance");
          }
        });
      `
    }
  ]
});
