foam.CLASS({
  package: 'net.nanopay.business',
  name: 'DeleteAgentJunctionsOnUserDeleteDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    When a user is marked as deleted, we need to delete the UserUserJunctions in
    agentJunctionDAO where the user being deleted is the target of the
    relationship.

    If we don't, then the switch business view will try to let the user act as a
    deleted business which leads to errors.
  `,

  imports: [
    'agentJunctionDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      /*
       * It's possible to set the 'deleted' property to 'true' directly rather
       * than by calling 'remove' and letting 'DeletedAwareDAO' do it for you.
       * Therefore we cover that case here. That's also the reason this is a
       * decorator instead of a rule. We'd need two rules, one for remove and
       * one for update otherwise. We could have also switched the order that
       * we decorate localUserDAO with RulerDAO and DeletedAwareDAO, but that
       * would mean our rule would have to apply on updates instead of removes,
       * and in fact the remove rules would never trigger at all, which is
       * unintuitive.
       */
      name: 'put_',
      javaCode: `
        long userId = ((User) obj).getId();

        // We only care about updates in this decorator, not inserts.
        if ( userId == 0 ) {
          return super.put_(x, obj);
        }

        // NOTE: We find with the admin context here because we don't want
        // DeletedAwareDAO further down the chain to stop us from seeing the
        // user before it's updated, which is what might happen if we use the
        // context given as an argument and that user doesn't have permission
        // to see deleted objects.
        User userBeforeUpdate = (User) super.find_(getX(), userId);
        User userAfterUpdate  = (User) super.put_(x, obj);

        if ( userAfterUpdate.getDeleted() && ! userBeforeUpdate.getDeleted() ) {
          deleteJunctions(x, userAfterUpdate.getId());
        }

        return userAfterUpdate;
      `
    },
    {
      name: 'remove_',
      javaCode: `
        FObject result = super.remove_(x, obj);

        deleteJunctions(x, ((User) obj).getId());

        return result;
      `
    },
    {
      name: 'deleteJunctions',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'Long',
          name: 'deletedUserId'
        }
      ],
      javaCode: `
        DAO agentJunctionDAO = ((DAO) getAgentJunctionDAO()).inX(x);
        agentJunctionDAO
          .where(EQ(UserUserJunction.TARGET_ID, deletedUserId))
          .removeAll();
      `
    }
  ]
});
