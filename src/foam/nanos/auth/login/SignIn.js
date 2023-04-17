/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.login',
  name: 'SignIn',

  properties: [
    {
      class: 'String',
      name: 'identifier',
      required: true,
      validationTextVisible: false,
      label: 'Email or Username',
      preSet: function(_, n) {
        return n.trim();
      }
    },
    {
      class: 'String',
      name: 'username',
      visibility: function(usernameRequired_) {
        return usernameRequired_ ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'email',
      hidden: true
    },
    {
      class: 'Password',
      name: 'password',
      required: true,
      validationTextVisible: false,
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true }
    },
    {
      class: 'Boolean',
      name: 'usernameRequired_',
      hidden: true
    }
  ]
});