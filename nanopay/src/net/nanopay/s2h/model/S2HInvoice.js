foam.CLASS({
  package: 'net.nanopay.s2h.model',
  name: 'S2HInvoice',

  documentation: 'S2H Invoice model.',

  imports: [ 'invoiceDAO' ],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.invoice.model.Invoice',
    'java.util.Date'
  ],

  messages: [
    { name: 'FormError', message: 'Error while saving your changes. Please review your input and try again.' }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'String',
      name: 'firstName',
      validateObj: function(firstName) {
        var hasOkLength = firstName.length >= 1 && firstName.length <= 70;

        if ( ! firstName || ! hasOkLength ) {
          return this.FormError;
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      validateObj: function(lastName) {
        var hasOkLength = lastName.length >= 1 && lastName.length <= 70;

        if ( ! lastName || ! hasOkLength ) {
          return this.FormError;
        }
      }
    },
    {
      class: 'String',
      name: 'companyName'
    },
    {
      class: 'String',
      name: 'invoiceNum'
    },
    {
      class: 'Date',
      javaFactory: 'return new Date();',
      name: 'date'
    },
    {
      class: 'Date',
      javaFactory: 'return new Date(System.currentTimeMillis() + 24 * 3600 * 1000);',
      name: 'dueDate'
    },
    {
      class: 'Date',
      name: 'datePaid'
    },
    {
      class: 'Double',
      name: 'subTotal'
    },
    {
      class: 'Double',
      name: 'credit'
    },
    {
      class: 'Double',
      name: 'tax'
    },
    {
      class: 'Double',
      name: 'tax2'
    },
    {
      class: 'Currency',
      name: 'total'
    },
    {
      class: 'Double',
      name: 'taxRate'
    },
    {
      class: 'Double',
      name: 'taxRate2'
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'paymentMethod'
    },
    {
      class: 'String',
      name: 'notes'
    },
    {
      class: 'String',
      name: 'currencyCode'
    },
    {
      class: 'String',
      name: 'currencyPrefix'
    },
    {
      class: 'String',
      name: 'currencySuffix'
    }

  ],

  methods: [
    {
      name: 'generateNanoInvoice',
        javaReturns: 'net.nanopay.invoice.model.Invoice',
        javaCode: `
          DAO invoiceDAO = (DAO) getX().get("invoiceDAO");

          Invoice inv = new Invoice();
          inv.setX(getX());

          inv.setInvoiceNumber(getInvoiceNum());
          inv.setPurchaseOrder("" + getId());
          inv.setIssueDate(getDate());
          inv.setDueDate(getDueDate());
          inv.setPaymentDate(getDatePaid());
          inv.setDraft(false);
          inv.setNote(getNotes());
          inv.setAmount(getTotal());
          inv.setCurrencyCode(getCurrencyCode());
          inv.setStatus(getStatus());
          inv.setPayeeId(2);
          inv.setPayerId(getUserId());
          invoiceDAO.put(inv);
          return inv;
          `
      }
  ]

});
