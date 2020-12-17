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

package net.nanopay.auth.openid;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;

import java.time.Instant;

public class OTLoginService implements NanoService, TokenLoginService {

  @Override
  public boolean loginTokenId(X x, String tokenId) {
    if (SafetyUtil.isEmpty(tokenId)) {
      throw new AuthenticationException("Invalid OTT Login Token ID");
    }

    var session = (Session) x.get(Session.class);
    var tokenDAO = (DAO) x.get("otLoginTokenDAO");
    var token = (OTLoginToken) tokenDAO.find(tokenId);

    if ( session == null ) {
      throw new AuthenticationException("Invalid session");
    }

    if ( token == null || token.getProcessed() ) {
      throw new AuthenticationException("Invalid OTT Login token");
    }

    session.setUserId(token.getUserId());
    x.put(Session.class, session);

    // set token processed to true
    token = (OTLoginToken) token.fclone();
    token.setProcessed(true);
    tokenDAO.put(token);

    return true;
  }

  // Set expiry to now + 1hr
  public Long generateExpiryDate() {
    return Instant.now().getEpochSecond() + 3600;
  }

  public String generateToken(X x, long userid) {
    var tokenDAO = (DAO) x.get("otLoginTokenDAO");

    var token = new OTLoginToken();
    token.setExpiry(generateExpiryDate());
    token.setUserId(userid);
    token = (OTLoginToken) tokenDAO.put(token);

    return token.getId();
  }

  @Override
  public void start() throws Exception {

  }
}
