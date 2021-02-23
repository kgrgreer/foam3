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
  package: 'net.nanopay.auth.sms',
  name: 'PhoneVerificationTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for verifying SMS',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'com.twilio.Twilio',
    'com.twilio.rest.api.v2010.account.Message',
    'com.twilio.type.PhoneNumber',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.util.SecurityUtil',
    'java.util.Calendar'
  ],

  properties: [
    {
      class: 'String',
      name: 'accountSid',
      documentation: 'Twilio account id'
    },
    {
      class: 'String',
      name: 'authToken',
      documentation: 'Twilio auth token'
    },
    {
      class: 'String',
      name: 'phoneNumber',
      documentation: 'Twilio phone number'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        Twilio.init(getAccountSid(), getAuthToken());
      `
    },
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        DAO tokenDAO = (DAO) x.get("localTokenDAO");

        // don't send token if already verified
        String phoneNumber = user.getPhoneNumber();
        if (user.getPhoneNumberVerified()) {
          throw new RuntimeException("Phone already verified");
        }

        String data = String.format("%04d",
          SecurityUtil.GetSecureRandom().nextInt(10000));
        tokenDAO.put(new Token.Builder(x)
          .setUserId(user.getId())
          .setExpiry(generateExpiryDate())
          .setData(data)
          .build());

        return Message.creator(new PhoneNumber(phoneNumber), new PhoneNumber(getPhoneNumber()),
          "Your MintChip phone verification pin is: " + data).create() != null;
      `
    },
    {
      name: 'processToken',
      javaCode: `
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO tokenDAO = (DAO) x.get("localTokenDAO");
        Calendar calendar = Calendar.getInstance();

        // find token
        Token result = (Token) tokenDAO.inX(x).find(MLang.AND(
          MLang.EQ(Token.PROCESSED, false),
          MLang.GT(Token.EXPIRY, calendar.getTime()),
          MLang.EQ(Token.DATA, token)));

        if ( result == null ) {
          throw new RuntimeException("Token not found");
        }

        // find user from token
        User newUser = (User) userDAO.find_(x, result.getUserId());
        if ( newUser == null ) {
          throw new RuntimeException("User not found");
        }

        if ( newUser.getPhoneNumberVerified() ) {
          throw new RuntimeException("Phone already verified");
        }

        // update phone to verified
        newUser = (User) newUser.fclone();
        newUser.setPhoneNumber(user.getPhoneNumber());
        newUser.setPhoneNumberVerified(true);
        userDAO.put_(x, newUser);

        // update token
        result = (Token) result.fclone();
        result.setProcessed(true);
        tokenDAO.put_(x, result);
        return true;
      `
    }
  ]
});
