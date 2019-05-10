foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'RequestSigningOfficersCompliance',

  documentation: 'Marks signing officers of a business as compliance requested.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.Detachable',
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
        DAO userDAO = business.getSigningOfficers(x).getDAO();
        userDAO.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            User signingOfficer = (User) obj;
            signingOfficer = (User) signingOfficer.fclone();

            signingOfficer.setCompliance(ComplianceStatus.REQUESTED);
            userDAO.put(signingOfficer);
          }
        });
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '//noop'
    }
  ]
});
