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
    'foam.nanos.auth.AuthService',
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
      args: [
        {
          type: 'User',
          name: 'user'
        }
      ],
      documentation: `Return a sanitized copy of the given user.`,
      javaCode: `
        User nu = new User();
        nu.setUserName(user.getUserName());
        nu.setEmail(user.getEmail());
        nu.setDesiredPassword(user.getDesiredPassword());
        nu.setSignUpToken(user.getSignUpToken());
        nu.setLanguage(user.getLanguage());
        return nu;
      `
    }
  ],
});
