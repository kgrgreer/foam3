foam.ENUM({
  package: 'net.nanopay.invoice.model',
  name: 'PaymentStatus',
  values: [
    {
      name: 'NONE',
      label: 'None'
    },
    {
      name: 'NANOPAY',
      label: 'Nanopaid'
    },
    {
      name: 'CHEQUE',
      label: 'Paid'
    },
    {
      name: 'VOID',
      label: 'Void'
    }
  ]
});

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
    'invoiceNumber', 'purchaseOrder', 'payerId', 'payeeId', 'issueDate', 'dueDate', 'amount', 'status'/*, 'payNow'*/
  ],

  javaImports: [ 'java.util.Date' ],

  constants: {
    RECORDED_PAYMENT: -2,
    DISPUTED_INVOICE: -1
  },

  properties: [
    {
      name: 'search',
      transient: true,
      searchView: { class: "foam.u2.search.TextSearchView", of: 'net.nanopay.invoice.model.Invoice', richSearch: true }
    },
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'invoiceNumber',
      label: 'Invoice #',
      aliases: [ 'invoice', 'i' ],
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      label: 'PO #',
      aliases: [ 'purchase', 'po', 'p' ],
    },
    {
      class: 'Date',
      name: 'issueDate',
      label: 'Issue Date',
      required: true,
      factory: function() { return new Date(); },
      javaFactory: 'return new Date();',
      aliases: [ 'issueDate', 'issue', 'issued' ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    },
    {
      class: 'Date',
      name: 'dueDate',
      label: 'Date Due',
      aliases: [ 'dueDate', 'due', 'd', 'issued' ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    },
    {
      class: 'Date',
      name: 'paymentDate',
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
      name: 'createdBy'
    },
    {
      class: 'String',
      name: 'currencyType'
    },
    {
      class: 'String',
      name: 'payeeName',
      label: 'Vendor',
      aliases: [ 'to', 'vendor', 'v' ],
      transient: true
    },
    {
      class: 'String',
      name: 'payerName',
      label: 'Customer',
      aliases: [ 'from', 'customer', 'c' ],
      transient: true
    },
    {
      class: 'Long',
      name: 'paymentId'
    },
    {
      class: 'Boolean',
      name: 'draft',
      value: false
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceId'
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceNumber'
    },
    {
      class: 'String',
      name: 'freshbooksInvoicePurchaseOrder'
    },
    {
      class: 'String',
      name: 'invoiceFileUrl'
    },
    {
      class: 'String',
      name: 'note',
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'String',
      name: 'invoiceImageUrl'
    },
    {
      class: 'Currency',
      name: 'amount',
      aliases: [ 'a' ],
      precision: 2,
      required: true,
      tableCellFormatter: function(a, X) {
        this.start().style({'padding-right': '20px'}).add('$' + X.addCommas((a/100).toFixed(2))).end();
      }
    },
    {
      class: 'Long',
      name: 'sourceAccountId'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.invoice.model.PaymentStatus',
      name: 'paymentMethod'
    },
    {
      class: 'String',
      name: 'currencyCode'
    },
    {
      name: 'iso20022'
    },
    {
      class: 'Long',
      name: 'accountId'
    },
    {
      class: 'String',
      name: 'status',
      transient: true,
      aliases: [ 's' ],
      expression: function(draft, paymentId, dueDate, paymentDate, paymentMethod) {
        if ( draft ) return 'Draft';
        if ( paymentMethod === this.PaymentStatus.VOID ) return 'Void';
        if ( paymentMethod === this.PaymentStatus.CHEQUE ) return 'Paid';
        if ( paymentMethod === this.PaymentStatus.NANOPAY ) return 'Paid';
        if ( paymentId === this.DISPUTED_INVOICE ) return 'Disputed';
        if ( paymentId > 0 || paymentDate < Date.now() && paymentId == this.RECORDED_PAYMENT) return 'Paid';
        if ( paymentDate > Date.now() && paymentId == 0 || paymentDate > Date.now() && paymentId == this.RECORDED_PAYMENT) return ('Scheduled');
        if ( dueDate ) {
          if ( dueDate.getTime() < Date.now() ) return 'Overdue';
          if ( dueDate.getTime() < Date.now() + 24*3600*7*1000 ) return 'Due';
        }
        return 'Due';
      },
      javaGetter: `
        if ( getDraft() ) return "Draft";
        if ( getPaymentMethod() == PaymentStatus.VOID ) return "Void";
        if ( getPaymentMethod() == PaymentStatus.CHEQUE ) return "Paid";
        if ( getPaymentMethod() == PaymentStatus.NANOPAY ) return "Paid";
        if ( getPaymentId() == -1 ) return "Disputed";
        if ( getPaymentId() > 0 ) return "Paid";
        if ( getPaymentDate() != null ){
          if ( getPaymentDate().after(new Date()) && getPaymentId() == 0 || getPaymentDate().after(new Date()) && getPaymentId() == -2 ) return "Scheduled";
        }
        if ( getDueDate() != null ){
          if ( getDueDate().getTime() < System.currentTimeMillis() ) return "Overdue";
          if ( getDueDate().getTime() < System.currentTimeMillis() + 24*3600*7*1000 ) return "Due";
        }
        return "Due";
      `,
      searchView: { class: "foam.u2.search.GroupBySearchView", width: 40, viewSpec: { class: 'foam.u2.view.ChoiceView', size: 8 } },
      tableCellFormatter: function(state, obj, rel) {
        function formatDate(d) { return d ? d.toISOString().substring(0,10) : ''; }

        var label;
        label = state;
        if ( state === 'Scheduled') {
          label = label + ' ' + obj.paymentDate.toISOString().substring(0,10);
        }

        this.start().addClass('generic-status').addClass('Invoice-Status-' + state).add(label).end();
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
      value: false,      
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function(status) {
        return false;
        return status !== 'Paid' && this.lookup('net.nanopay.interac.ui.etransfer.TransferWizard', true);
      },
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.interac.ui.etransfer.TransferWizard', invoice: this })
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
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.label());
      }.bind(this));
    },
    postSet: function(oldValue, newValue){
      var self = this;
      var dao = this.__context__.userDAO;
      dao.find(newValue).then(function(a) {
        if ( a ) {
          self.payeeName = a.label();
          // if ( a.address ) self.currencyType = a.address.countryId + 'D';
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
//    aliases: [ 'from', 'customer' ],
    searchView: {
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.label());
      }.bind(this));
    },
    postSet: function(oldValue, newValue){
      var self = this;
      var dao = this.__context__.userDAO;
      dao.find(newValue).then(function(a) {
        if ( a ) {
          self.payerName = a.label();
          // if ( a.address ) self.currencyType = a.address.countryId + 'D';
        } else {
          self.payerName = 'Unknown Id: ' + newValue;
        }
      });
    }
  }
});
