foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'RequestBeneficialOwnersCompliance',

  documentation: 'Marks beneficial owners of a business as compliance requested.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.Detachable',
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
        Business business = (Business) obj;
        DAO beneficialOwnerDAO = business.getBeneficialOwners(x);
        beneficialOwnerDAO.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            BeneficialOwner owner = (BeneficialOwner) obj;
            owner = (BeneficialOwner) owner.fclone();

            owner.setCompliance(ComplianceStatus.REQUESTED);
            beneficialOwnerDAO.put(owner);
          }
        });
      `
    }
  ]
});
