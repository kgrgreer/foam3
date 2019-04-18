foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind.predicate',
  name: 'ConsumerKYCStage3',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.mlang.sink.Count',
    'net.nanopay.model.BusinessUserJunction',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        User user = (User) NEW_OBJ.f(obj);
        DAO dao = (DAO) ((X) obj).get("signingOfficerJunctionDAO");
        Count officerCount = (Count) dao.where(
          EQ(BusinessUserJunction.TARGET_ID, user.getId())
        ).select(new Count());
        return officerCount.getValue() > 0;
      `
    }
  ]
});
