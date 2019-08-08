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
