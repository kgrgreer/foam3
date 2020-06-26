foam.CLASS({
  package: 'net.nanopay.admin',
  name: 'AccountStatusUserDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    This DAO decorator updates the previousStatus property on the user model
    to be equal to the user's old status whenever the status property is updated
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AccountStatusUserDAO(X x, DAO delegate) {
            super(x, delegate);
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());
        PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("status");

        // If new status and old status are different then set previous status
        if ( oldUser != null && ! SafetyUtil.equals(prop.get(newUser), prop.get(oldUser)) ) {
          newUser.setPreviousStatus(oldUser.getStatus());
        }

        return super.put_(x, obj);
      `
    }
  ]
});

