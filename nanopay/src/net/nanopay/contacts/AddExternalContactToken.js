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
  package: 'net.nanopay.contacts',
  name: 'AddExternalContactToken',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    This class is a decorator of the localUserDAO which generates
    the externalContactToken when adding an external contact.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
 
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID',
    'java.util.Map',
    'static foam.mlang.MLang.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AddExternalContactToken(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
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
        User externalContact = (User) obj.fclone();
        if ( externalContact instanceof PersonalContact ) {
          DAO tokenDAO = ((DAO) x.get("localTokenDAO")).inX(x);

          // Handle the existing external contact
          if ( externalContact.getId() != 0 ) {
            /**
             * Check the amount of tokens to see if it is an existing contact with the tokens
             * or it is a newly created contact without any token that is related.
             */
            List<Token> tokensList = ((ArraySink) tokenDAO
              .where(EQ(Token.USER_ID, externalContact.getId())).select(new ArraySink())).getArray();

            Token token;
            if ( tokensList.size() > 1 ) {
              return super.put_(x, obj);
            } else if ( tokensList.size() == 1 ) {
              token = tokensList.get(0);
            } else {
              token = null;
            }

            if ( token == null || ! (token instanceof ExternalContactToken) ) {
              this.addToken(externalContact, tokenDAO);
            } else {
              /**
               * Do nothing. We have already created the ExternalContactToken
               * for this business but they haven't signed up yet.
               */
            }
          } else {
            // When adding a new external contact, it will generate the externalContactToken
            this.addToken(externalContact, tokenDAO);
          }
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'addToken',
      type: 'Void',
      args: [
        { type: 'User', name: 'externalContact' },
        { type: 'DAO', name: 'tokenDAO' }
      ],
      javaCode: `
        Map tokenParams = new HashMap();
        tokenParams.put("inviteeEmail", externalContact.getEmail());
        ExternalContactToken externalToken = new ExternalContactToken();
        externalToken.setParameters(tokenParams);
        externalToken.setUserId(externalContact.getId());
        externalToken.setData(UUID.randomUUID().toString());
        externalToken.setBusinessEmail(externalContact.getEmail());
        tokenDAO.put(externalToken);
      `
    }
  ]
});

