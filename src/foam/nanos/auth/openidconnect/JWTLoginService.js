/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
    package: 'foam.nanos.auth.openidconnect',
    name: 'JWTLoginService',

    skeleton: true,

    documentation: `
    The JWT Login Service allows user to exchange signed JWT id tokens for authenticated sessions
  `,

    methods: [
        {
            name: 'login',
            documentation: `
        Log the user in using their JWT token.
      `,
            async: true,
            type: 'foam.nanos.auth.User',
            javaThrows: ['foam.nanos.auth.AuthenticationException'],
            swiftThrows: true,
            args: [
                {
                    name: 'x',
                    type: 'Context'
                },
                {
                    name: 'token',
                    type: 'String'
                }
            ]
        }
    ]
});
