foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'BusinessInvitationAndTokenCancelRule',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that sets invitation as cancelled and the associated token as processed
      when invite has been revoked.
    `,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.token.Token',
      'foam.nanos.auth.User',
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
                );

              if ( existingInvite != null ) {
                tokenData = existingInvite.getTokenData();
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
