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
      name: 'GLOBAL_INVOICE_READ',
      type: 'String',
      value: 'invoice.read.*'
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
    { name: 'NULL_INVOICE_ERROR_MSG', message: 'Cannot put null' }
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
              user_ = ((Subject) x.get("subject")).getUser();
              if ( user_ == null ) throw new AuthenticationException();
            }

            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              Invoice invoice = (Invoice) obj;
              if ( isRelated(getX(), invoice) && ! ( invoice.getDraft() && invoice.getCreatedBy() != user_.getId() ) &&
                  ! ( invoice.getCreatedBy() != user_.getId() && invoice.getStatus() == InvoiceStatus.PENDING_APPROVAL && invoice.getPayeeId() == user_.getId()) &&
                  ! ( invoice.getCreatedBy() != user_.getId() && invoice.getStatus() == InvoiceStatus.VOID ) &&
                  ! ( invoice.getCreatedBy() != user_.getId() && invoice.getStatus() == InvoiceStatus.REJECTED ) ) {
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
      javaCode: `
        User user = this.getUser(x);
        Invoice invoice = (Invoice) obj;

        if ( invoice == null ) {
          throw new IllegalArgumentException(NULL_INVOICE_ERROR_MSG);
        }
        // TODO temporary fix
        String temp = invoice.getReferenceId();

        // Check if the user has invoice.create permission
        Invoice oldInvoice = (Invoice) getDelegate().find(obj);
        if ( oldInvoice == null && ! getAuth().check(x, "invoice.create") ) {
          throw new AuthorizationException(CREATE_INVOICE_ERROR_MSG);
        }

        // Check if the user has global access permission.
        if ( ! getAuth().check(x, GLOBAL_INVOICE_READ) ) {
          Invoice existingInvoice = (Invoice) super.find_(x, invoice.getId());

          // Disable updating reference id's
          if ( existingInvoice != null && ! SafetyUtil.equals(invoice.getReferenceId(), existingInvoice.getReferenceId()) ) {
            throw new AuthorizationException(UPDATE_REF_ID_ERROR_MSG);
          }

          // Check if the user is the creator of the invoice or existing invoice
          if ( ! this.isRelated(x, invoice) || existingInvoice != null && ! this.isRelated(x, existingInvoice) ) {
            throw new AuthorizationException();
          }
          // Check if invoice is draft,
          if ( invoice.getDraft() ) {
            // If invoice currently exists and is not created by current user -> throw exception.
            if ( existingInvoice != null && (invoice.getCreatedBy() != user.getId()) ) {
              throw new AuthorizationException();
            }
          }
        }
        // Whether the invoice exist or not, utilize put method and dao will handle it.
        return getDelegate().put_(x, invoice);
      `
    },
    {
      name: 'find_',
      javaCode: `
        User user = this.getUser(x);
        Invoice invoice = (Invoice) super.find_(x, id);

        if ( invoice != null && ! getAuth().check(x, GLOBAL_INVOICE_READ)) {
          // Check if user is related to the invoice
          if ( ! this.isRelated(x, invoice) ) {
            throw new AuthorizationException();
          }
          // limiting draft invoice to those who created the invoice.
          if ( invoice.getDraft() && ( invoice.getCreatedBy() != user.getId() ) ) {
            throw new AuthorizationException();
          }
        }
        return invoice;
      `
    },
    {
      name: 'select_',
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
          throw new AuthenticationException();
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
        { type: 'Invoice', name: 'invoice' }
      ],
      documentation: 'Determine if the user is payee or payer',
      javaCode: `
        User user = getUser(x);
        long id = user.getId();
        boolean isPayee = invoice.getPayeeId() == id;
        boolean isPayer = invoice.getPayerId() == id;
        List<Contact> contacts = getContactsWithEmail(x, user.getEmail());
        if ( contacts != null ) {
          for ( Contact contact : contacts ) {
            if ( invoice.getPayeeId() == contact.getId() ) {
              isPayee = true;
            }
            if ( invoice.getPayerId() == contact.getId() ) {
              isPayer = true;
            }
          }
        }
        return  isPayee || isPayer;
      `
    },
    {
      name: 'getContactsWithEmail',
      visibility: 'protected',
      javaType: 'List<Contact>',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'String', name: 'emailAddress' }
      ],
      javaCode: `
        if ( SafetyUtil.isEmpty(emailAddress) ) return null;
        DAO contactDAO = (DAO) x.get("localContactDAO");
        ArraySink contactsWithMatchingEmail = (ArraySink) contactDAO
          .where(AND(
            EQ(Contact.EMAIL, emailAddress),
            INSTANCE_OF(Contact.class)))
          .select(new ArraySink());
        return contactsWithMatchingEmail.getArray();
      `
    }
  ]
});

