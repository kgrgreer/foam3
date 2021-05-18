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
  package: 'net.nanopay.invoice',
  name: 'AuthenticatedInvoiceDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'foam.util.SafetyUtil',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',

    'java.util.List',

    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],

  constants: [
    {
      name: 'INVOICE_CREATE',
      type: 'String',
      value: 'invoice.create'
    },
    {
      name: 'GLOBAL_INVOICE_CREATE',
      type: 'String',
      value: 'invoice.create.*'
    },
    {
      name: 'GLOBAL_INVOICE_READ',
      type: 'String',
      value: 'invoice.read.*'
    },
    {
      name: 'GLOBAL_INVOICE_UPDATE',
      type: 'String',
      value: 'invoice.update.*'
    },
    {
      name: 'GLOBAL_INVOICE_DELETE',
      type: 'String',
      value: 'invoice.remove.*'
    }
  ],

  messages: [
    { name: 'CREATE_INVOICE_ERROR_MSG', message: 'You do not have permission to create invoices' },
    { name: 'UPDATE_REF_ID_ERROR_MSG', message: 'Cannot update reference Id' },
    { name: 'NO_INVOICE_ERROR_MSG', message: 'Invoice doesn\'t exist' },
    { name: 'DELETE_INVOICE_ERROR_MSG', message: 'Only invoice drafts can be deleted' },
    { name: 'DELETE_INVOICE_ERROR_MSG2', message: 'You can only delete invoices that you created' },
    { name: 'NULL_INVOICE_ERROR_MSG', message: 'Cannot put null' },
    { name: 'UPDATE_INVOICE_PERMISSION_ERR', message: 'You do not have permission to update this invoice' },
    { name: 'READ_INVOICE_PERMISSION_ERR', message: 'You do not have permission to view this invoice' },
    { name: 'INVOICE_REMOVED_ERR', message: 'The invoice has already been removed.' },
    { name: 'NO_USER_ERR', messages: 'Cannot find user in context' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.AuthService',
      name: 'auth'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthenticatedInvoiceDAO(X x, DAO delegate) {
            super(x, delegate);
            setAuth((AuthService) x.get("auth"));
          }

          private class AuthenticatedInvoiceSink extends foam.dao.ProxySink {
            private User user_;

            public AuthenticatedInvoiceSink(X x, Sink delegate) {
              super(x, delegate);
              user_ = AuthenticatedInvoiceDAO.this.getUser(x);
            }

            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              Invoice invoice = (Invoice) obj;
              if (
                isRelated(getX(), user_.getId(), invoice) && 
                ( invoice.getCreatedBy() == user_.getId() ||
                  ! ( invoice.getStatus() == InvoiceStatus.PENDING_APPROVAL && invoice.getPayeeId() == user_.getId() ||
                    invoice.getStatus() == InvoiceStatus.VOID ||
                    invoice.getStatus() == InvoiceStatus.REJECTED ) ) ) {
                getDelegate().put(obj, sub);
              }
            }
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      documentation: `
        To create an invoice, the user must have the global invoice create permission, and be 'related' to the invoice via 
        the isRelated method, and the other party of the invoice must be a contact of the user;
        To update an invoice, the user must either have the global update permission, or be 'related' to the invoice with the
        other party of the invoice being a contact of the user
      `,
      javaCode: `
        User user = getUser(x);

        Invoice invoice = (Invoice) obj;

        if ( invoice == null ) {
          throw new IllegalArgumentException(NULL_INVOICE_ERROR_MSG);
        }

        // If creating a new invoice, user must have global invoice create permission
        Invoice old = (Invoice) getDelegate().find(invoice.getId());
        if ( old == null && ! getAuth().check(x, INVOICE_CREATE) )
          throw new AuthorizationException(CREATE_INVOICE_ERROR_MSG);

        // if updating an invoice, skip the following checks if user has the global update permission
        if ( ( old != null && getAuth().check(x, GLOBAL_INVOICE_UPDATE) ) ||
             ( old == null && getAuth().check(x, GLOBAL_INVOICE_CREATE) ) 
        ) return getDelegate().put_(x, invoice);

        // Do not allow updates to reference ID 
        if ( old != null && ! SafetyUtil.equals(invoice.getReferenceId(), old.getReferenceId()) )
          throw new AuthorizationException(UPDATE_REF_ID_ERROR_MSG);

        // Check that user is 'related' to invoice and other party of invoice is contact of the usere
        if ( ! isRelated(x, user.getId(), invoice) || old != null && ! isRelated(x, user.getId(), old) )
          throw new AuthorizationException(UPDATE_INVOICE_PERMISSION_ERR);

        return getDelegate().put_(x, invoice);
      `
    },
    {
      name: 'find_',
      documentation: `
        To view an invoice, user must either 
        - have the global read permission, or 
        - be related to the invoice to be found, and the invoice must not have been removed
      `,
      javaCode: `
        User user = getUser(x);
        Invoice invoice = (Invoice) super.find_(x, id);

        if ( invoice != null && ! getAuth().check(x, GLOBAL_INVOICE_READ)) {
          // Check if user is related to the invoice
          if ( ! this.isRelated(x, user.getId(), invoice) ) {
            throw new AuthorizationException(READ_INVOICE_PERMISSION_ERR);
          }
        }
        return invoice;
      `
    },
    {
      name: 'select_',
      documentation: `
        To select from the invoiceDAO, user must either 
        - have the global read permission, or 
        - be related to the invoice to be found, and the invoice must not have been removed
      `,
      javaCode: `
        if ( getAuth().check(x, GLOBAL_INVOICE_READ) ) {
          return super.select_(x, sink, skip, limit, order, predicate);
        }

        Sink authenticatedInvoiceSink = new AuthenticatedInvoiceSink(x, sink);
        getDelegate().select_(x, authenticatedInvoiceSink, skip, limit, order, predicate);
        return sink;
      `
    },
    {
      name: 'remove_',
      documentation: `
        Allows users with invoice delete permission and users who created the invoice to proceed with the remove.
        If user is permitted, the invoice will be handled by it's Lifecycle.
      `,
      javaCode: `
        User user = this.getUser(x);

        Invoice invoice = (Invoice) super.inX(x).find(obj);

        if ( invoice == null ) {
          throw new AuthenticationException(NO_INVOICE_ERROR_MSG);
        }

        if ( getAuth().check(x, GLOBAL_INVOICE_DELETE) ) {
          return getDelegate().remove_(x, obj);
        }

        if ( ! invoice.getDraft() ) {
          throw new AuthorizationException(DELETE_INVOICE_ERROR_MSG);
        }

        if ( user.getId() != invoice.getCreatedBy() ) {
          throw new AuthorizationException(DELETE_INVOICE_ERROR_MSG2);
        }

        return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'getUser',
      visibility: 'protected',
      type: 'User',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          throw new AuthenticationException(NO_USER_ERR);
        }
        return user;
      `
    },
    {
      name: 'isRelated',
      visibility: 'protected',
      type: 'Boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Long', name: 'userId' },
        { type: 'Invoice', name: 'invoice' }
      ],
      documentation: `
        Determine if the user is related to the invoice, will return true if
          - invoice is a draft created by user, or
          - invoice is not draft, and user is a payee of payer of invoice
      `,
      javaCode: `
        boolean userIsPayeeOrPayer = invoice.getPayeeId() == userId || invoice.getPayerId() == userId;
        boolean userIsCreator = invoice.getCreatedBy() == userId;

        return userIsPayeeOrPayer && ( invoice.getDraft() ? userIsCreator : true );
      `
    }
  ]
});
