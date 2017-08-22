
foam.CLASS({
  package: 'net.nanopay.b2b.ui.history',
  name: 'HistoryView',
  extends: 'foam.u2.View',

  documentation: 'History View of Invoices.',

  imports: [ 'historyDAO' ],
  properties: [ 
    'selection', 
    { name: 'data', factory: function() { return this.historyDAO; }}
  ],
  
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        */
      }
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({ 
              class: 'foam.u2.history.HistoryView',
              data: this.historyDAO,
              historyItemView: net.nanopay.b2b.HistoryInvoiceItemView.create()
            });
    }
  ]
});