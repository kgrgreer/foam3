foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceDashboardView',
  extends: 'foam.u2.Element',

  documentation: 'View displaying high-level Sales and Expenses SummaryViews.',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [ 
    'formatCurrency',
    'user'
  ],

  requires: [ 'net.nanopay.invoice.model.Invoice' ],

  properties: [
    {
      name: 'payableAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      class: 'Currency',
      name: 'formattedPayableAmount',
      expression: function(payableAmount) { return this.formatCurrency(payableAmount); }
    },
    {
      name: 'receivableAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      class: 'Currency',
      name: 'formattedReceivableAmount',
      expression: function(receivableAmount) { return this.formatCurrency(receivableAmount); }
    },
    {
      name: 'salesDAO',
      factory: function() {
        return this.user.sales;
      }
    },
    {
      name: 'expensesDAO',
      factory: function() {
        return this.user.expenses;
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 992px;
          margin: auto;
        }
        .resize-button{
          height: 30px;
          width: 60px;
          display: inline-block;
          text-align: center;
          line-height: 30px;
        }
        ^cashflow-summary{
          border-radius: 3px;
          background: white;
          width: 953px;
          text-align: center;
        }
        ^cashflow-summary h4 {
          font-weight: 300;
          display: inline-block;
        }
        .overall-receivables{
          color: #2cab70;
          margin-left: 150px;
        }
        .overall-payables{
          color: #c82e2e;
          text-align: center;
          width: 200px;
        }
        .overall-receivables img{
          top: 8px;
          right: 5px;
          transform: rotate(180deg);
          position: relative;
        }
        .overall-payables img{
          position: relative;
          top: 5px;
          right: 5px;
        }
        .overall-label{
          margin-left: 100px;
        }
        ^ .net-nanopay-invoice-ui-PayableSummaryView .net-nanopay-invoice-ui-SummaryCard{
          width: 15.9%;
        }
        ^ .blue-card-title{
          background: %SECONDARYCOLOR%;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.expensesDAO.on.sub(this.onDAOUpdate);
      this.salesDAO.on.sub(this.onDAOUpdate);      
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('light-roboto-h2').style({ 'margin-top': '15px' }).add('Weekly Summary').end()
        // .start().addClass('green-border-container')
        //   .start().addClass('resize-button').style({ 'background': '#1cc2b7','color' : 'white'}).add('Me').end()
        //   .start().addClass('resize-button').add('Team').end()
        // .end()
        .tag({class: 'net.nanopay.invoice.ui.MentionsView'})
        .tag({class: 'net.nanopay.invoice.ui.PayableSummaryView'})
        .tag({class: 'net.nanopay.invoice.ui.ReceivablesSummaryView'})
        .start().addClass(this.myClass('cashflow-summary'))
          .start('h4').addClass('overall-label').add('Overall Cashflow Summary').end()
          .start().addClass('overall-receivables inline').add()
            .tag({class:'foam.u2.tag.Image', data: 'images/green-arrow.png'})
            .start('h4').add('+', this.formattedReceivableAmount$).end()
          .end()
          .start().addClass('overall-payables inline').add()
            .tag({class:'foam.u2.tag.Image', data: 'images/red-arrow.png'})
            .start('h4').add('-', this.formattedPayableAmount$).end()
          .end()
        .end()
    }
  ],



  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;

        this.expensesDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.payableAmount = sum.value;
        });

        this.salesDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum){
          self.receivableAmount = sum.value;
        })
      }
    }
  ]
});