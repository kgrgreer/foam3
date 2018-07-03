foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'Invoice',

  documentation: 'Invoice model. Amount is set to double type.',

  requires: [ 'net.nanopay.invoice.model.PaymentStatus' ],

  imports: [ 'addCommas' ],

  searchColumns: [
    'search', 'payerId', 'payeeId', 'status'
  ],

  tableColumns: [
    'invoiceNumber', 'purchaseOrder', 'payerId', 'payeeId', 'issueDate', 'dueDate', 'amount', 'status'
  ],

  javaImports: [ 'java.util.Date' ],

  properties: [
    {
      name: 'search',
      documentation: ``, // TODO
      transient: true,
      searchView: { class: 'foam.u2.search.TextSearchView', of: 'net.nanopay.invoice.model.Invoice', richSearch: true }
    },
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'invoiceNumber',
      documentation: `A number used by the user to identify the invoice.`,
      label: 'Invoice #',
      aliases: [
        'invoice',
        'i'
      ],
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      documentation: `A number used by the user to identify the purchase order
          associated with the invoice.`,
      label: 'PO #',
      aliases: [
        'purchase',
        'po',
        'p'
      ]
    },
    {
      class: 'Date',
      name: 'issueDate',
      documentation: `The date that the invoice was issued (created).`,
      label: 'Issue Date',
      required: true,
      factory: function() {
        return new Date();
      },
      javaFactory: 'return new Date();',
      aliases: [
        'issueDate',
        'issue',
        'issued'
      ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      }
    },
    {
      class: 'Date',
      name: 'dueDate',
      documentation: `The date that the invoice must be paid by.`,
      label: 'Date Due',
      aliases: [ 'dueDate', 'due', 'd', 'issued' ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      }
    },
    {
      class: 'Date',
      name: 'paymentDate',
      documentation: `The date that the invoice was paid.`,
      label: 'Received',
      aliases: [ 'scheduled', 'paid' ],
      tableCellFormatter: function(date) {
        if ( date ) {
          this.add(date.toISOString().substring(0,10));
        }
      }
    },
    {
      class: 'Long',
      name: 'createdBy',
      documentation: `The id of the user who created the invoice.`,
    },
    {
      class: 'String',
      name: 'currencyType',
      documentation: ``, // TODO
    },
    {
      class: 'String',
      name: 'payeeName',
      documentation: `The name of the party receiving the payment.`,
      label: 'Vendor',
      aliases: [ 'to', 'vendor', 'v' ],
      transient: true
    },
    {
      class: 'String',
      name: 'payerName',
      documentation: `The name of the party making the payment.`,
      label: 'Customer',
      aliases: [ 'from', 'customer', 'c' ],
      transient: true
    },
    {
      class: 'Long',
      name: 'paymentId',
      documentation: ``, // TODO
    },
    {
      class: 'Boolean',
      name: 'draft',
      documentation: `Used to track whether an invoice is finalized or not.`,
      value: false
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceId',
      documentation: ``, // TODO
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceNumber',
      documentation: ``, // TODO
    },
    {
      class: 'String',
      name: 'freshbooksInvoicePurchaseOrder',
      documentation: ``, // TODO
    },
    {
      class: 'String',
      name: 'invoiceFileUrl',
      documentation: ``, // TODO
    },
    {
      class: 'String',
      name: 'note',
      documentation: `A written note that the user may add to the invoice.`,
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'String',
      name: 'invoiceImageUrl',
      documentation: ``, // TODO
    },
    {
      class: 'Currency',
      name: 'amount',
      documentation: `The amount of money the invoice is for.`,
      aliases: [
        'a'
      ],
      precision: 2,
      required: true,
      tableCellFormatter: function(a, X) {
        this.start().style({ 'padding-right': '20px' })
          .add('$' + X.addCommas((a/100).toFixed(2)))
        .end();
      }
    },
    {
      class: 'Long',
      name: 'sourceAccountId',
      documentation: `` // TODO
    },
    {
      class: 'Enum',
      of: 'net.nanopay.invoice.model.PaymentStatus',
      name: 'paymentMethod',
      documentation: `The state of payment of the invoice.`
    },
    {
      class: 'String',
      name: 'currencyCode',
      documentation: `` // TODO
    },
    {
      name: 'iso20022',
      documentation: `` // TODO
    },
    {
      class: 'Long',
      name: 'accountId',
      documentation: `` // TODO
    },
    {
      class: 'String',
      name: 'status',
      documentation: `The state of the invoice regarding payment. This is a
          calculated property used to determine whether an invoice is due, void,
          pending, paid, scheduled, or overdue.`,
      transient: true,
      aliases: [
        's'
      ],
      expression: function(draft, paymentId, dueDate, paymentDate, paymentMethod) {
        if ( draft ) return 'Draft';
        if ( paymentMethod === this.PaymentStatus.VOID ) return 'Void';
        if ( paymentMethod === this.PaymentStatus.PENDING ) return 'Pending';
        if ( paymentMethod === this.PaymentStatus.CHEQUE ) return 'Paid';
        if ( paymentMethod === this.PaymentStatus.NANOPAY ) return 'Paid';
        if ( paymentDate > Date.now() && paymentId == 0 ) return ('Scheduled');
        if ( dueDate ) {
          if ( dueDate.getTime() < Date.now() ) return 'Overdue';
          if ( dueDate.getTime() < Date.now() + 24*3600*7*1000 ) return 'Due';
        }
        return 'Due';
      },
      javaGetter: `
        if ( getDraft() ) return "Draft";
        if ( getPaymentMethod() == PaymentStatus.VOID ) return "Void";
        if ( getPaymentMethod() == PaymentStatus.PENDING ) return "Pending";
        if ( getPaymentMethod() == PaymentStatus.CHEQUE ) return "Paid";
        if ( getPaymentMethod() == PaymentStatus.NANOPAY ) return "Paid";
        if ( getPaymentDate() != null ){
          if ( getPaymentDate().after(new Date()) && getPaymentId() == 0 ) return "Scheduled";
        }
        if ( getDueDate() != null ){
          if ( getDueDate().getTime() < System.currentTimeMillis() ) return "Overdue";
          if ( getDueDate().getTime() < System.currentTimeMillis() + 24*3600*7*1000 ) return "Due";
        }
        return "Due";
      `,
      searchView: {
        class: 'foam.u2.search.GroupBySearchView',
        width: 40,
        viewSpec: {
          class: 'foam.u2.view.ChoiceView',
          size: 8
        }
      },
      tableCellFormatter: function(state, obj, rel) {
        var label;
        label = state;
        if ( state === 'Scheduled' ) {
          label = label + ' ' + obj.paymentDate.toISOString().substring(0, 10);
        }

        this.start()
          .addClass('generic-status')
          .addClass('Invoice-Status-' + state)
          .add(label)
        .end();
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'invoiceFile',
      documentation: 'Original invoice file',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView' }
    },
    {
      class: 'Boolean',
      name: 'scheduledEmailSent',
      documentation: `Used to track whether an email has been sent to the payer
          informing them that the payment they scheduled is near.`,
      value: false
    }
  ],

  actions: [
    {
      name: 'payNow',
      documentation: `Let the user pay an invoice immediately.`,
      label: 'Pay now',
      isAvailable: function(status) {
        return false;
        return status !== 'Paid' && this.lookup('net.nanopay.interac.ui.etransfer.TransferWizard', true);
      },
      code: function(X) {
        X.stack.push({
          class: 'net.nanopay.interac.ui.etransfer.TransferWizard',
          invoice: this
        });
      }
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'sales',
  inverseName: 'payeeId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Vendor',
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function(resolve, reject) {
          dao.find(key).then(function(user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function(o) {
        this.add(o.label());
      }.bind(this));
    },
    postSet: function(oldValue, newValue) {
      var self = this;
      var dao = this.__context__.userDAO;
      dao.find(newValue).then(function(a) {
        if ( a ) {
          self.payeeName = a.label();
        } else {
          self.payeeName = 'Unknown Id: ' + newValue;
        }
      });
    }
  }
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'expenses',
  inverseName: 'payerId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Customer',
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise( function(resolve, reject) {
          dao.find(key).then( function(user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then( function(o) {
        this.add(o.label());
      }.bind(this));
    },
    postSet: function(oldValue, newValue) {
      var self = this;
      var dao = this.__context__.userDAO;
      dao.find(newValue).then(function(a) {
        if ( a ) {
          self.payerName = a.label();
        } else {
          self.payerName = 'Unknown Id: ' + newValue;
        }
      });
    }
  }
});
