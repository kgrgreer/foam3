foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'BusinessInvitationAndTokenCancelRule',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that set invitation as canceled and token as processed.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.token.Token',
      'foam.nanos.auth.User',
      'net.nanopay.model.Business',
      'net.nanopay.model.Business',
      'net.nanopay.model.Invitation',
      'net.nanopay.model.InvitationStatus',

      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              DAO businessInvitationDAO = (DAO) x.get("businessInvitationDAO");
              DAO tokenDAO = (DAO) x.get("localTokenDAO");
              String tokenData = null;
              Invitation invitation = (Invitation) obj;
              Token token = null;

              Invitation existingInvite = (Invitation) businessInvitationDAO
                .find(
                  AND(
                    EQ(Invitation.CREATED_BY, invitation.getCreatedBy()),
                    EQ(Invitation.EMAIL, invitation.getEmail())
                  )
                ).fclone();

              if ( existingInvite != null ) {
                tokenData = existingInvite.getTokenData();
                existingInvite.setStatus(InvitationStatus.CANCELED);
                businessInvitationDAO.put(existingInvite);
              }

              if ( tokenData != null ) {
                token = (Token) tokenDAO
                  .find(
                    AND(
                      EQ(Token.DATA, tokenData),
                      EQ(Token.PROCESSED, false)
                    )
                  );

                if ( token != null ) {
                  token = (Token) token.fclone();
                  token.setProcessed(true);
                  tokenDAO.put(token);
                }
              }
            }
          }, "updated invitation and token");
        `
      }
    ]
});
