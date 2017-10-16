foam.CLASS({
  package: 'net.nanopay.b2b.model',
  name: 'Invoice',

  documentation: 'Invoice information.',

  ids: [ 'invoiceNumber' ],


  tableColumns: [
    'invoiceNumber', 'purchaseOrder', 'toBusinessName', 'issueDate', 'amount', 'status', 'payNow'
  ],

  properties: [
    {
      name: 'search',
      transient: true,
      searchView: { class: "foam.u2.search.TextSearchView", of: 'net.nanopay.b2b.model.Invoice', richSearch: true }
    },

    {
      class: 'Long',
      name: 'invoiceNumber',
      label: 'Invoice #',
      aliases: [ 'id', 'invoice', 'i' ],
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
      label: 'Date Due',
      required: true,
      factory: function() { return new Date(); },
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
      class: 'String',
      name: 'toBusinessName',
      label: 'Vendor',
      aliases: [ 'to', 'vendor', 'v' ],
      transient: true
    },
    {
      class: 'String',
      name: 'fromBusinessName',
      label: 'Customer',
      aliases: [ 'from', 'customer', 'c' ],
      transient: true
    },
    {
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
      name: 'invoiceImageUrl'
    },
    {
      // TODO: make Currency class
      class: 'Double',
      name: 'amount',
      aliases: [ 'a' ],
      required: true,
      tableCellFormatter: function(a) {
        this.start().style({'padding-right': '20px'}).add('$' + a.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')).end();
      }
    },
    {
      class: 'Double',
      name: 'currencyCode',
      required: true
    },
    {
      name: 'iso20022',
      required: true
    },
    {
      name: 'status',
      transient: true,
      aliases: [ 's' ],
      expression: function(draft, paymentId, issueDate, paymentDate) {
        if ( draft ) return 'Draft';
        if ( paymentId === -1 ) return 'Disputed';
        if ( paymentId ) return 'Paid';
        if ( issueDate.getTime() < Date.now() ) return 'Overdue';
        if ( issueDate.getTime() < Date.now() + 24*3600*7*1000 ) return 'Due';
        return paymentDate ? 'Scheduled' : 'New';
      },
      searchView: { class: "foam.u2.search.GroupBySearchView", width: 40, viewSpec: { class: 'foam.u2.view.ChoiceView', size: 8 } },
      tableCellFormatter: function(state, obj, rel) {
        function formatDate(d) { return d ? d.toISOString().substring(0,10) : ''; }

        var label;

        if ( state === 'Scheduled' || state === 'Paid' ) {
          label = state;
        } else {
          label = state;
        }

        this.start().addClass('Invoice-Status-' + state).add(label).end();
      }
    },
    {
      name: 'wizardViewBtn',
      label: '',
      tableCellFormatter: function(fees, X){
        this.start()
          .add(X.PAY_NOW)
        .end()
      }
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function(status) {
        return status !== 'Paid';
      },
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.interac.ui.etransfer.TransferWizard', invoice: this })
      }
    }
  ]
});
