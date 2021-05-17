/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.auth.ruler',
  name: 'AddExternalContactTokenRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: 'Generates the externalContactToken when adding an external contact.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.mlang.sink.Count',
    'net.nanopay.contacts.ExternalContactToken',
    'net.nanopay.contacts.PersonalContact',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.UUID',

    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            var externalContact = (User) obj.fclone();
            if ( externalContact instanceof PersonalContact ) {
              var tokenDAO = (DAO) x.get("localTokenDAO");

              // Handle the existing external contact
              if ( externalContact.getId() != 0 ) {
                /**
                 * Check if an external token exists for the contact or if it is
                 * a newly created contact without any token that is related.
                 */
                var externalTokenCount = ((Count) tokenDAO.where(AND(
                  EQ(Token.USER_ID, externalContact.getId()),
                  INSTANCE_OF(ExternalContactToken.class)
                )).select(new Count()));

                if ( externalTokenCount.getValue() == 0 ) {
                  AddExternalContactTokenRuleAction.this.addToken(externalContact, tokenDAO);
                }
              } else {
                // When adding a new external contact, it will generate the externalContactToken
                AddExternalContactTokenRuleAction.this.addToken(externalContact, tokenDAO);
              }
            }
          }
        }, "Add External Contact Token");
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
        var tokenParams = new HashMap();
        tokenParams.put("inviteeEmail", externalContact.getEmail());
        var externalToken = new ExternalContactToken();
        externalToken.setParameters(tokenParams);
        externalToken.setUserId(externalContact.getId());
        externalToken.setData(UUID.randomUUID().toString());
        externalToken.setBusinessEmail(externalContact.getEmail());
        tokenDAO.put(externalToken);
      `
    }
  ]
});
