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
  package: 'net.nanopay.contacts',
  name: 'InvoiceToContactDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    All Contacts are meant to reference a Business. However, they won't reference
    a Business until that Business is created, after which the Contacts will be
    updated to refer to the newly created Business.
    When putting an invoice to pay a Contact, we want to check if the Business
    reference has been set and if so, change the payeeId on the Invoice to the
    id of the Business. That way it's a payment directly from a Business to a
    Business.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.invoice.model.Invoice'
  ],

  messages: [
    { name: 'NULL_INVOICE_ERROR_MSG', message: 'Cannot pull null' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'localUserDAO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public InvoiceToContactDAO(X x, DAO delegate) {
            super(x, delegate);
            setLocalUserDAO(((DAO) x.get("localUserDAO")).inX(x));
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
        if ( obj == null ) throw new RuntimeException(NULL_INVOICE_ERROR_MSG);

        Invoice invoice = (Invoice) obj;

        if ( ! isNew(invoice) ) {
          return super.put_(x, obj);
        }

        User user = ((Subject) x.get("subject")).getUser();

        boolean isPayable = invoice.getPayerId() == user.getId();
        boolean isReceivable = invoice.getPayeeId() == user.getId();

        if ( invoice.getContactId() != 0 ) {
          User contact = (User) getLocalUserDAO().inX(x).find(invoice.getContactId());
          long idToSet;
          long businessId = ((Contact) contact).getBusinessId();
          if ( businessId != 0 ) {
            idToSet = businessId;
          } else {
            invoice.setExternal(true);
            idToSet = contact.getId();
          }

          if ( isPayable ) {
            invoice.setPayeeId(idToSet);
          }  else if ( isReceivable ) {
            invoice.setPayerId(idToSet);
          }
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'isNew',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'Invoice', name: 'invoice' }
      ],
      javaCode: `
        return super.find(invoice.getId()) == null;
      `
    }
  ]
});
