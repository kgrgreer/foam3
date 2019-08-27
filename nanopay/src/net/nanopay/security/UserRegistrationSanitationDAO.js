/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserRegistrationSanitationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Sanitize the user object being put so that only expected fields are allowed
    to be set to non-default values.
  `,

  javaImports: [
    'foam.nanos.auth.User',
    'java.util.Objects'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User user = (User) Objects.requireNonNull(obj, "User cannot be null.");
        return super.put_(x, sanitize(user));
      `
    },
    {
      name: 'sanitize',
      type: 'User',
      args: [{ type: 'User', name: 'user' }],
      documentation: `Return a sanitized copy of the given user.`,
      javaCode: `
        return new User.Builder(getX())
          .setFirstName(user.getFirstName())
          .setLastName(user.getLastName())
          .setEmail(user.getEmail())
          .setDesiredPassword(user.getDesiredPassword())
          .setOrganization(user.getOrganization())
          .setSignUpToken(user.getSignUpToken())
          .setBusinessAddress(user.getBusinessAddress())
          .setAddress(user.getAddress())
          .setBirthday(user.getBirthday())

          // TODO: Remove the need for this property.
          .setWelcomeEmailSent(user.getWelcomeEmailSent())

          .build();
      `
    }
  ],
});
