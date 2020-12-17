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

foam.CLASS({
  package: 'net.nanopay.partners',
  name: 'AuthenticatedInvitationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',

    'java.util.Date',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  messages: [
    {
      name: 'CREATE_INVITE_ERROR_MSG',
      message: 'If you want to create a new invite, you have to set `createdBy` to the id of the current user.'
    },
    {
      name: 'INVITE_ERROR_MSG',
      message: 'You cannot invite yourself.'
    },
    { name: 'NULL_INVITE_ERROR_MSG',
      message: 'Cannot put null'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private AuthService auth_;

          public AuthenticatedInvitationDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            auth_ = (AuthService) x.get("auth");
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
        Invitation invite = (Invitation) obj;

        if ( invite == null ) {
          throw new RuntimeException(NULL_INVITE_ERROR_MSG);
        }

        invite = (Invitation) invite.fclone();
        Invitation existingInvite = (Invitation) getDelegate().find_(x, invite);

        if ( existingInvite != null ) {
          if ( auth_.check(x, "*") ) return super.put_(x, obj);

          this.checkPermissions(x, existingInvite);

          // Valid business case #1: User is responding to an invite
          User user = this.getUser(x);
          boolean isRespondingToInvite =
              existingInvite.getStatus() == InvitationStatus.SENT &&
              (invite.getStatus() == InvitationStatus.ACCEPTED ||
              invite.getStatus() == InvitationStatus.IGNORED) &&
              existingInvite.getInviteeId() == user.getId();

          if ( isRespondingToInvite ) {
            InvitationStatus status = invite.getStatus();
            this.copyReadOnlyFields(existingInvite, invite);
            invite.setStatus(status);
            return getDelegate().put_(x, invite);
          }

          // Note to developer: If you're adding a feature that requires that users
          // be able to put to this DAO from the client, add a conditional statement
          // above that allows only the specific properties through that are
          // required for your feature, but only under the conditions that it makes
          // sense to do so.

        } else {
          this.prepareNewInvite(x, invite);
        }

        return super.put_(x, invite);
      `
    },
    {
      name: 'find_',
      javaCode: `
        Invitation invite = (Invitation) getDelegate().find_(x, id);

        if ( invite == null ) return null;

        this.checkPermissions(x, invite);
        return invite;
      `
    },
    {
      name: 'select_',
      javaCode: `
        DAO dao = this.getSecureDAO(x);
        return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        Invitation invite = (Invitation) obj;

        if ( invite == null ) return null;

        this.checkPermissions(x, invite);
        return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        DAO dao = this.getSecureDAO(x);
        dao.removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'checkPermissions',
      type: 'Void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Invitation', name: 'invite' }
      ],
      javaCode: `
        User user = this.getUser(x);
        boolean hasPermission = auth_.check(x, "*") || this.isOwner(user, invite);
    
        if ( ! hasPermission ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'getSecureDAO',
      type: 'DAO',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        if ( auth_.check(x, "*") ) return getDelegate();
        User user = this.getUser(x);
        long id = user.getId();
        return getDelegate().where(OR(
            EQ(Invitation.CREATED_BY, id),
            EQ(Invitation.INVITEE_ID, id)));
      `
    },
    {
      name: 'getUser',
      type: 'User',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          throw new AuthenticationException();
        }
        return user;
      `
    },
    {
      name: 'isOwner',
      type: 'Boolean',
      args: [
        { type: 'User', name: 'user' },
        { type: 'Invitation', name: 'invite' }
      ],
      javaCode: `
        long id = user.getId();
        return invite.getInviteeId() == id || invite.getCreatedBy() == id;
      `
    },
    {
      // TODO: This probably shouldn't be happening in this decorator.
      name: 'prepareNewInvite',
      type: 'Void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Invitation', name: 'invite' }
      ],
      javaCode: `
        User user = this.getUser(x);

        AuthService auth = (AuthService) x.get("auth");
        if ( invite.getCreatedBy() != user.getId() && ! auth.check(x, "*") ) {
          throw new AuthorizationException(CREATE_INVITE_ERROR_MSG);
        }

        if ( user.getEmail().equals(invite.getEmail()) )  {
          throw new AuthorizationException(INVITE_ERROR_MSG);
        }

        // Check if invitee is a contact, an external user, or an internal user.
        DAO contactDAO = user.getContacts(x);
        User recipient = this.getUserByEmail(contactDAO.inX(x), invite.getEmail());
        boolean isContact = recipient != null;
        boolean internal = false;
        if ( ! isContact ) {
          DAO localUserUserDAO = (DAO) x.get("localUserUserDAO");
          recipient = this.getUserByEmail(localUserUserDAO.inX(x), invite.getEmail());
          internal = recipient != null;
        }

        long createdBy = invite.getCreatedBy();
        String email = invite.getEmail();
        String message = invite.getMessage();
        this.copyReadOnlyFields(new Invitation(), invite);
        invite.setCreatedBy(createdBy);
        invite.setEmail(email);
        invite.setInternal(internal);
        invite.setIsContact(isContact);
        invite.setMessage(message);
        invite.setStatus(InvitationStatus.SENT);

        // Set to date in distant past so that SendInvitationDAO will send the
        // email
        invite.setTimestamp(new Date(0L));

        if ( recipient != null ) invite.setInviteeId(recipient.getId());
      `

    },
    {
      name: 'getUserByEmail',
      type: 'User',
      args: [
        { type: 'DAO', name: 'userDAO' },
        { type: 'String', name: 'emailAddress' }
      ],
      javaCode: `
        return (User) userDAO.find(EQ(User.EMAIL, emailAddress));
      `
    },
    {
      name: 'copyReadOnlyFields',
      type: 'Void',
      args: [
        { type: 'Invitation', name: 'from' },
        { type: 'Invitation', name: 'to' },
      ],
      javaCode: `
        to.setCreatedBy(from.getCreatedBy());
        to.setInviteeId(from.getInviteeId());
        to.setEmail(from.getEmail());
        to.setId(from.getId());
        to.setInternal(from.getInternal());
        to.setTimestamp(from.getTimestamp());
        to.setMessage(from.getMessage());
      `
    }
  ]
});

