foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AuthenticatedAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'net.nanopay.contacts.Contact',

    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR'
  ],

  constants: [
    {
      name: 'GLOBAL_ACCOUNT_READ',
      type: 'String',
      value: 'account.read.*'
    },
    {
      name: 'GLOBAL_ACCOUNT_UPDATE',
      type: 'String',
      value: 'account.update.*'
    },
    {
      name: 'GLOBAL_ACCOUNT_DELETE',
      type: 'String',
      value: 'account.delete.*'
    },
    {
      name: 'GLOBAL_ACCOUNT_CREATE',
      type: 'String',
      value: 'account.create'
    }
  ],

  messages: [
    { name: 'UPDATE_PERMISSION_ERROR_MSG', message: 'You do not have permission to update that account.' },
    { name: 'CREATE_PERMISSION_ERROR_MSG', message: 'You do not have permission to create an account for another user.'},
    { name: 'DELETE_PERMISSION_ERROR_MSG', message: 'Unable to delete bank account due to insufficient permissions.' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthenticatedAccountDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        Account newAccount = (Account) obj;
        AuthService auth = (AuthService) x.get("auth");
        DAO userDAO_ = (DAO) x.get("bareUserDAO");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        Account oldAccount = (Account) getDelegate().find_(x, obj);
        boolean isUpdate = oldAccount != null;

        if ( isUpdate ) {
          boolean ownsAccount = newAccount.getOwner() == user.getId() && oldAccount.getOwner() == user.getId();

          if (
            ! ownsAccount &&
            ! auth.check(x, GLOBAL_ACCOUNT_UPDATE) &&
            ! ownsContactThatOwnsAccount(x, newAccount) &&
            ! ownsContactThatOwnsAccount(x, oldAccount)
          ) {
            throw new AuthorizationException(UPDATE_PERMISSION_ERROR_MSG);
          }
        } else if (
          newAccount.getOwner() != user.getId() &&
          ! auth.check(x, "account.create") &&
          ! ownsContactThatOwnsAccount(x, newAccount)
        ) {
          throw new AuthorizationException(CREATE_PERMISSION_ERROR_MSG);
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        Account account = (Account) super.find_(x, id);

        if ( account == null ) return null;

        if (
          account.getOwner() == user.getId() ||
          auth.check(x, GLOBAL_ACCOUNT_READ) ||
          ownsContactThatOwnsAccount(x, account)
        ) {
          return account;
        }

        return null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        boolean global = auth.check(x, GLOBAL_ACCOUNT_READ);
        DAO dao = global ? getDelegate() : getDelegate().where(
          OR(
            EQ(Account.OWNER, user.getId()),
            EQ(Account.CREATED_BY, user.getId())
          )
        );
        return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        Account account = (Account) obj;
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        if (
          account != null &&
          account.getOwner() != user.getId() &&
          ! auth.check(x, GLOBAL_ACCOUNT_DELETE) &&
          ! ownsContactThatOwnsAccount(x, account)
        ) {
          throw new AuthorizationException(DELETE_PERMISSION_ERROR_MSG);
        }

        return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        boolean global = auth.check(x, GLOBAL_ACCOUNT_DELETE);
        DAO dao = global ? getDelegate() : getDelegate().where(EQ(Account.OWNER, user.getId()));
        dao.removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'ownsContactThatOwnsAccount',
      type: 'Boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Account', name: 'account' }
      ],
      documentation: `
        Check if the user in the context owns a contact that owns the given account.
        @param x The user context.
        @param account The account to check.
        @return true if the given account is owned by a contact that the user owns.
      `,
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        User owner = account.findOwner(x);
        return owner instanceof Contact && ((Contact) owner).getOwner() == user.getId();
      `
    }
  ]
});

