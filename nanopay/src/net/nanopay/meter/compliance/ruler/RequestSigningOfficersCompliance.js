foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
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
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        business.getSigningOfficers(x).getDAO()
          .select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              User signingOfficer = (User) localUserDAO.find(obj).fclone();

              // User.compliance is a permissioned property thus we need
              // to use localUserDAO when saving change to the property.
              signingOfficer.setCompliance(ComplianceStatus.REQUESTED);
              localUserDAO.inX(x).put(signingOfficer);
            }
          });
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '//noop'
    },
    {
      name: 'canExecute',
      javaCode: `
      // TODO: add an actual implementation
      return true;
      `
    },
    {
      name: 'describe',
      javaCode: `
      // TODO: add an actual implementation
      return "";`
    }
  ]
});
