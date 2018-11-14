foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceRowView',
  extends: 'foam.u2.View',

  documentation: `
    A single row in a list of invoices.

    USAGE: 

      properties: [
        ...
        {
          class: 'foam.dao.DAOProperty',
          name: 'myDAO'
        }
        ...
      ]

      initE() {
        ...
        .select(this.myDAO$proxy, function(invoice) {
          return this.E().start({
            class: 'net.nanopay.sme.ui.InvoiceRowView',
            data: invoice
          })
            .on('click', function() {
              // Do something with the invoice if you want.
            })
          .end();
        })
        ...
      }
  `,

  imports: [
    'user'
  ],

  css: `
    ^ {
      cursor: pointer;
      box-shadow: 0 1px 1px 0 #dae1e9;
      background: white;
      border-bottom: 1px solid #e2e2e3;
      padding: 12px 24px;
    }

    ^row {
      display: flex;
      justify-content: space-between;
      padding: 4px;
    } 
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'data',
      documentation: 'Set this to the invoice you want to display in this row.'
    },
    {
      class: 'String',
      name: 'currencyFormatted',
      value: '...',
      documentation: `Used internally to show the formatted currency value.`
    }
  ],

  methods: [
    function initE() {
      var label = this.data.payeeId === this.user.id ?
        this.data.payer.businessName || this.data.payer.label() :
        this.data.payee.businessName || this.data.payee.label();
      var dueDateFormatted = this.data.dueDate ?
        'Due ' + this.data.dueDate.toISOString().slice(0, 10) :
        '';

      this.data.destinationCurrency$find.then((currency) => {
        this.currencyFormatted = currency.format(this.data.amount) + ' ' +
          currency.alphabeticCode;
      });

      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('row'))
          .start('span').add(label).end()
          .start('span')
            .call(
              this.data.STATUS.tableCellFormatter.f,
              [this.data.status, this.data]
            )
          .end()
        .end()
        .start()
          .addClass(this.myClass('row'))
          .start('span').add(this.currencyFormatted$).end()
          .start('span').add(dueDateFormatted).end()
        .end();
    }
  ]
});
