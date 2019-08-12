package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.auth.token.Token;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import static foam.mlang.MLang.*;

/**
 * This class is a decorator of the localUserDAO which generates
 *  the externalContactToken when adding an external contact.
 */
public class AddExternalContactToken extends ProxyDAO {

  public AddExternalContactToken(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User externalContactUser = (User) obj;
    if ( externalContactUser instanceof Contact ) {
      DAO tokenDAO = ((DAO) x.get("tokenDAO")).inX(x);

      if ( externalContactUser.getId() != 0 ) {
        /**
         * Check the amount of tokens to see if it is an existing contact with the tokens
         * or it is a newly created contact without any token that is related.
         */
        List<Token> tokensList = ((ArraySink) tokenDAO
          .where(EQ(Token.USER_ID, externalContactUser.getId())).select(new ArraySink())).getArray();

        Token token;
        if ( tokensList.size() > 1 ) {
          return super.put_(x, obj);
        } else if ( tokensList.size() == 1 ) {
          token = tokensList.get(0);
        } else {
          token = null;
        }

        if ( token == null || ! (token instanceof ExternalContactToken) ) {

          ExternalContactToken externalToken;
          if ( token == null ) {
            externalToken = new ExternalContactToken();
          } else {
            externalToken = (ExternalContactToken) token.fclone();
          }

          Map tokenParams = new HashMap();
          tokenParams.put("inviteeEmail", externalContactUser.getEmail());

          externalToken.setParameters(tokenParams);
          externalToken.setUserId(externalContactUser.getId());
          externalToken.setData(UUID.randomUUID().toString());
          externalToken.setBusinessEmail(externalContactUser.getEmail());
          tokenDAO.put(externalToken);
        } else {
          /**
           * Do nothing. We have already created the ExternalContactToken
           * for this business but they haven't signed up yet.
           */
        }
      } else {
        // When adding a contact without banking information
        ExternalContactToken externalToken = new ExternalContactToken();
        Map tokenParams = new HashMap();

        tokenParams.put("inviteeEmail", externalContactUser.getEmail());
        externalToken.setParameters(tokenParams);
        externalToken.setUserId(externalContactUser.getId());
        externalToken.setData(UUID.randomUUID().toString());
        externalToken.setBusinessEmail(externalContactUser.getEmail());
        tokenDAO.put(externalToken);
      }
    }

    return super.put_(x, obj);
  }
}
