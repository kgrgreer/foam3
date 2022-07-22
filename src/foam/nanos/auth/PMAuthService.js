/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PMAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  requires: [
    'foam.nanos.pm.PM'
  ],

  javaImports: [
    'foam.core.X',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'classType',
      class: 'Class',
      javaFactory: `
        return PMAuthService.getOwnClassInfo();
      `,
      hidden: true
    },
    {
      name: 'label',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'getNameFor',
      args: [
        {
          name: 'name',
          type: 'String'
        }
      ],
      type: 'String',
      javaCode: `
        String label = getLabel();
        return "auth" +
          ("".equals(label) ? "" : "/" + label) +
          ":" + name;
      `
    },

    // Proxy methods, to be monitored
    {
      name: 'login',
      javaCode: `
      PM pm = null;
      if ( getEnabled() ) pm = PM.create(x, this.getClass(), getNameFor("login"));
      try {
        return super.login(x, identifier, password);
      } finally {
        if ( pm != null ) pm.log(x);
      }
     `
    },
    {
      name: 'validatePassword',
      javaCode: `
      PM pm = null;
      if ( getEnabled() ) pm = PM.create(x, this.getClass(), getNameFor("validatePassword"));
      try {
        super.validatePassword(x, user, potentialPassword);
      } finally {
        if ( pm != null ) pm.log(x);
      }
     `
    },
    {
      name: 'checkUser',
      javaCode: `
      PM pm = null;
      if ( getEnabled() ) pm = PM.create(x, this.getClass(), getNameFor("checkUser"));
      try {
        return super.checkUser(x, user, permission);
      } finally {
        if ( pm != null ) pm.log(x);
      }
     `
    },
    {
      name: 'check',
      javaCode: `
      PM pm = null;
      if ( getEnabled() ) pm = PM.create(x, this.getClass(), getNameFor("check"));
      try {
        return super.check(x, permission);
      } finally {
        if ( pm != null ) pm.log(x);
      }
     `
    },
    {
      name: 'updatePassword',
      javaCode: `
      PM pm = null;
      if ( getEnabled() ) pm = PM.create(x, this.getClass(), getNameFor("updatePassword"));
      try {
        return super.updatePassword(x, oldPassword, newPassword);
      } finally {
        if ( pm != null ) pm.log(x);
      }
     `
    },
    {
      name: 'validateUser',
      javaCode: `
      PM pm = null;
      if ( getEnabled() ) pm = PM.create(x, this.getClass(), getNameFor("validateUser"));
      try {
        super.validateUser(x, user);
      } finally {
        if ( pm != null ) pm.log(x);
      }
     `
    },
    {
      name: 'logout',
      javaCode: `
      PM pm = null;
      if ( getEnabled() ) pm = PM.create(x, this.getClass(), getNameFor("logout"));
      try {
        super.logout(x);
      } finally {
        if ( pm != null ) pm.log(x);
      }
     `
    },
  ]
});
