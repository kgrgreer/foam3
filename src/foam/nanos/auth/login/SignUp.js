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
    { name: 'USERNAME_EMPTY_ERR', message: 'Username required' },
    { name: 'USERNAME_AVAILABILITY_ERR', message: 'This username is taken. Please try another.' },
    { name: 'EMAIL_AVAILABILITY_ERR', message: 'This email is already in use. Please sign in or use a different email' },
    { name: 'WEAK_PASSWORD_ERR', message: 'Password is weak' }
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
          isAvailable$: X.data.usernameAvailable$,
          inputValidation: /^[^\s\/]+$/,
          restrictedCharacters: /^[^\s\/]$/
        };
      },
      validationPredicates: [
        {
          args: ['username'],
          query: 'username.len>0',
          errorMessage: 'USERNAME_EMPTY_ERR'
        },
        {
          args: ['usernameAvailable'],
          query: 'usernameAvailable==true',
          errorMessage: 'USERNAME_AVAILABILITY_ERR'
        }
      ]
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
          isAvailable$: X.data.emailAvailable$,
          inputValidation: /\S+@\S+\.\S+/,
          restrictedCharacters: /^[^\s]$/,
          displayMode: foam.u2.DisplayMode.RW
        };
      },
      validationPredicates: [
        {
          args: ['email'],
          query: 'email.len>0&&email~/\\S+@\\S+\.\\S+$/',
          errorMessage: 'EMAIL_ERR'
        },
        {
          args: ['emailAvailable'],
          query: 'emailAvailable==true',
          errorMessage: 'EMAIL_AVAILABILITY_ERR'
        }
      ]
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.PasswordView',
          isAvailable$: X.data.passwordAvailable$,
          passwordIcon: true
        }
      },
      validationPredicates: [
        {
          args: ['desiredPassword'],
          query: 'desiredPassword exists && desiredPassword.len>10',
          errorMessage: 'PASSWORD_ERR'
        },
        {
          args: ['passwordAvailable'],
          query: 'passwordAvailable==true',
          errorMessage: 'WEAK_PASSWORD_ERR'
        }
      ]
    },
    {
      name: 'dao_',
      hidden: true,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'emailAvailable',
      value: true,
      hidden: true,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'usernameAvailable',
      value: true,
      hidden: true,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'passwordAvailable',
      value: true,
      hidden: true,
      transient: true
    }
  ]
});
