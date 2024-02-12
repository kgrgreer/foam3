/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'NSpec',

  javaImplements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.EnabledAware'
  ],

  constants: [
    {
      name: 'NSPEC_CTX_KEY',
      type: 'String',
      value: 'NSPEC_CTX_KEY',
      documentation: 'Constant for addressing the NSpec through the context'
    }
  ],

  requires: [
    {
      path: 'foam.comics.BrowserView',
      flags: ['web']
    },
    'foam.nanos.script.Language'
  ],

  imports: [
    'window'
  ],

  javaImports: [
    'java.io.IOException',
    'java.io.PrintStream',

    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.script.BeanShellExecutor',
    'foam.nanos.script.JShellExecutor',
    'foam.nanos.script.Language'
  ],

  ids: [ 'name' ],

  tableColumns: [ 'name', 'lazy', 'serve', 'authenticate', /*'serviceClass',*/ 'configure' ],

  properties: [
    {
      class: 'String',
      name: 'name',
      displayWidth: '60',
      tableWidth: 460
    },
    {
      class: 'String',
      name: 'description',
      shortName: 'd',
      width: 120
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Boolean',
      name: 'lazy',
      tableWidth: 65,
      value: true
    },
    {
      class: 'Boolean',
      name: 'lazyClient',
      tableWidth: 65,
      value: true
    },
    {
      class: 'Boolean',
      name: 'serve',
      tableWidth: 72,
      documentation: 'If true, this service is served over the network via boxes. If the service is a WebAgent, it will be served as a WebAgent only if this is false.'
    },
    {
      class: 'Boolean',
      name: 'authenticate',
      shortName: 'a',
      value: true
    },
    {
      class: 'Boolean',
      name: 'parameters',
      value: false
    },
    {
      class: 'Boolean',
      name: 'pm',
      value: true
    },
    {
      documentation: `When enabled, a reference to the 'built' NSpec is managed by a ThreadLocal, as to avoid the synchronization overhead associated with accessing the created singleton service.`,
      class: 'Boolean',
      name: 'threadLocalEnabled',
      value: false
    },
    {
      class: 'FObjectProperty',
      name: 'service',
      view: 'foam.u2.view.FObjectView',
      javaCloneProperty: 'set(dest, get(source));',
      readPermissionRequired:  true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'serviceClass',
      shortName: 'sc',
      displayWidth: 80,
      readPermissionRequired:  true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'boxClass',
      shortName: 'bc',
      displayWidth: 80,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.script.Language',
      name: 'language',
      value: 'BEANSHELL'
    },
    {
      class: 'Code',
      name: 'serviceScript',
      shortName: 'ss',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Code',
      name: 'client',
      value: '{}',
      authNotes: 'Do not define shortName since the ClientBuilder uses projection for nSpecDAO.select and shortName will be returned if defined but the ClientBuilder promise only looks for spec.client to build the client services.' ,
    },
    {
      class: 'String',
      name: 'documentation',
      shortName: 'doc',
      view: {
        class: 'foam.u2.view.ModeAltView',
        writeView: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 140 },
        readView:  { class: 'foam.u2.view.PreView' }
      },
      readPermissionRequired:  true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'authNotes',
      view: {
        class: 'foam.u2.view.ModeAltView',
        writeView: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 140 },
        readView:  { class: 'foam.u2.view.PreView' }
      },
      readPermissionRequired:  true,
      writePermissionRequired: true
    },
    {
      class: 'StringArray',
      name: 'keywords',
      shortName: 'ks'
    },
    {
      class: 'String',
      name: '_choiceText_',
      transient: true,
      javaGetter: 'return getName();',
      getter: function() { return this.name; }
    }
    // TODO: permissions, parent
  ],

  methods: [
    {
      name: 'createService',
      args: [
        { name: 'x',  type: 'Context' },
        { name: 'ps', type: 'PrintStream' }
      ],
      javaType: 'java.lang.Object',
      javaCode: `
        if ( getService() != null ) return getService();

        if ( getServiceClass().length() > 0 )
          return Class.forName(getServiceClass()).newInstance();

        Language l = getLanguage();

        if ( l == foam.nanos.script.Language.JSHELL )
          return new JShellExecutor().runExecutor(x, ps, getServiceScript());

        if ( l == foam.nanos.script.Language.BEANSHELL )
          return new BeanShellExecutor(this).execute(x, ps, getServiceScript());

        throw new RuntimeException("Script language not supported");
      `,
      javaThrows: [
        'Exception',
        'IOException',
        'java.lang.ClassNotFoundException',
        'java.lang.IllegalAccessException',
        'java.lang.InstantiationException',
        'NoSuchFieldException',
        'SecurityException'
      ]
    },
    {
      name: 'checkAuthorization',
      type: 'Void',
      documentation: `
        Given a user's session context, throw an exception if the user doesn't
        have permission to access this service.
      `,
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        if ( ! getAuthenticate() ) return;

        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "service." + getName()) ) {
          throw new AuthorizationException("You do not have permission to access the service named " + getName());
        }
      `,
    },
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        String permission = "nspec.create";
        AuthService auth = (AuthService) x.get("auth");

        if ( ! auth.check(x, permission) ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("AuthorizableAuthorizer", "Permission denied.", permission);
          throw new AuthorizationException("Permission denied: Cannot create NSpec.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        try {
          checkAuthorization(x);
        } catch ( AuthorizationException e ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("AuthorizableAuthorizer", "Permission denied", "service." + getId());
          throw new AuthorizationException("Permission denied: Cannot read this NSpec.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `

      String permission = "nspec.update." + getId();
      AuthService auth = (AuthService) x.get("auth");

      if ( ! auth.check(x, permission) ) {
        ((foam.nanos.logger.Logger) x.get("logger")).debug("AuthorizableAuthorizer", "Permission denied.", permission);
        throw new AuthorizationException("Permission denied: Cannot update this NSpec.");
      }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        String permission  = "nspec.remove." + getId();
        AuthService auth = (AuthService) x.get("auth");

        if ( ! auth.check(x, permission) ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("AuthorizableAuthorizer", "Permission denied.", permission);
          throw new AuthorizationException("Permission denied: Cannot delete this NSpec.");
        }
      `
    }
  ],

  actions: [
    {
      // Let user configure this service. Is hard-coded to work with DAO's
      // for now, but should get the config object from the NSpec itself
      // to be extensible.
      name: 'configure',
      isAvailable: function(boxClass, serve) {
        return serve && ! boxClass;
//        return foam.dao.DAO.isInstance(this.__context__[this.name]);
      },
      code: function() {
        var service = this.__context__[this.name];
        if ( foam.dao.DAO.isInstance(service) ) {
          this.window.location = `#admin.data/${this.name}`;
        }
      }
    }
  ]
});
