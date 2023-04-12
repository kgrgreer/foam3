/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.login',
  name: 'SignUp',

  messages: [
    { name: 'EMAIL_ERR', message: 'Valid email required' },
    { name: 'PASSWORD_ERR', message: 'Password should be at least 10 characters' },
    { name: 'USERNAME_ERR', message: 'Username required' }
  ],

  properties: [
    {
      class: 'String',
      name: 'username',
      label: 'Username',
      placeholder: 'example123',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.UserPropertyAvailabilityView',
          icon: 'images/checkmark-small-green.svg',
          onKey: true,
          inputValidation: /^[^\s\/]+$/,
          restrictedCharacters: /^[^\s\/]$/
        };
      },
      validateObj: function(username) {
        if ( username.length === 0 ) return this.USERNAME_ERR;
      }
    },
    {
      class: 'EMail',
      name: 'email',
      placeholder: 'example@example.com',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.UserPropertyAvailabilityView',
          icon: 'images/checkmark-small-green.svg',
          onKey: true,
          inputValidation: /\S+@\S+\.\S+/,
          restrictedCharacters: /^[^\s]$/,
          displayMode: foam.u2.DisplayMode.RW
        };
      },
      validateObj: function(email) {
        if ( email.length === 0 || ! /\S+@\S+\.\S+/.test(email) ) return this.EMAIL_ERR;
      }
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.PasswordView',
          passwordIcon: true
        }
      },
      validateObj: function(desiredPassword) {
        if ( ! desiredPassword || desiredPassword.length < 10 ) return this.PASSWORD_ERR;
      }
    },
    {
      name: 'dao_',
      hidden: true,
      transient: true
    }
  ]
});
