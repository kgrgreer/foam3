/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AuthorizeAnonymousClientDecorator',
  extends: 'foam.nanos.auth.ProxyAuthService',

  imports: [
    'subject'
  ],

  documentation: `
    An auth service decorator that handles the required client side variables when authorizing a 
    vacant user.
  `,

  methods: [
    async function authorizeAnonymous(x) {
      var result = await this.delegate.authorizeAnonymous(null);
      if ( ! result || ! result.user ) throw new Error();
      this.subject = result;
      return this.subject;
    }
  ]
});
