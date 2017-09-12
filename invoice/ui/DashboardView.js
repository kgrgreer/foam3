foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'DashboardView',
  extends: 'foam.u2.Element',

  documentation: 'View displaying high-level Sales and Expenses SummaryViews.',

  implements: [
    'foam.mlang.Expressions', 
  ],

  imports: [ 'invoiceDAO', 'business', 'currencyFormatter' ],


  requires: [ 'net.nanopay.invoice.model.Invoice' ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.invoiceDAO; }
    },
    {
      class: 'Double',
      name: 'payableAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      name: 'formattedPayableAmount',
      expression: function(payableAmount) { return this.currencyFormatter.format(payableAmount); }
    },
    {
      class: 'Double',
      name: 'receivableAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      name: 'formattedReceivableAmount',
      expression: function(receivableAmount) { return this.currencyFormatter.format(receivableAmount); }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 992px;
          margin: auto;
        }
        ^ h2 {
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          color: #093649;
          opacity: 0.6;
          margin-bottom: 35px;
          display: inline-block;
          width: 200px;
        }
        .card-title{
          display: block;
          width: 135px;
          height: 70px;
          padding-top: 30px;
          border-radius: 2px;
          background-color: #59aadd;
          text-align: center;
          color: white;
          font-weight: 16px;
          display: inline-block;
        }
        .resize-button{
          height: 30px;
          width: 60px;
          line-height: 30px;
        }
        .dashboard-button-div{
          display: inline-block;
        }
        ^cashflow-summary{
          background: white;
          width: 945px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          text-align: center;
          padding: 5px 0;
        }
        ^cashflow-summary h4 {
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          display: inline-block;
        }
        .overall-receivables{
          color: #2cab70;
          margin-left: 150px;
        }
        .overall-detail{
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.3px;
          text-align: left;
          display: inline-block;
          text-align: center;         
        }
        .overall-payables{
          color: #c82e2e;
          text-align: center;
          width: 200px;
        }
        .overall-payables{
          top: 4;
          right: 4;
          position: relative;
        }
        .overall-receivables img{
          top: 8;
          transform: rotate(180deg);
          position: relative;
        }
        .overall-detail h4 {
          font-weight: 400;
        }
        .overall-label{
          margin-left: 50px;
        }
        ^ .net-nanopay-b2b-ui-shared-summaryViews-PayableSummaryView .net-nanopay-b2b-ui-shared-summaryViews-SummaryCard{
          width: 15.9%;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.b2b.RegistrationProgressView'})
        .start('h2').add('Weekly Summary').end()
        .start().addClass('dashboard-button-div')
          .start().addClass('contacts-button resize-button').add('Me').end()
          .start().addClass('pending-contacts-button resize-button').add('Team').end()
        .end()
        .tag({class: 'net.nanopay.b2b.ui.shared.summaryViews.MentionsView'})
        .tag({class: 'net.nanopay.b2b.ui.shared.summaryViews.PayableSummaryView'})
        .tag({class: 'net.nanopay.b2b.ui.shared.summaryViews.ReceivablesSummaryView'})
        .start().addClass(this.myClass('cashflow-summary'))
          .start('h4').addClass('overall-label').add('Overall Cashflow Summary').end()
          .start().addClass('overall-receivables overall-detail').add()
            .tag({class:'foam.u2.tag.Image', data: 'images/green-arrow.png'})
            .start('h4').add('+', this.formattedReceivableAmount$).end()
          .end()
          .start().addClass('overall-payables overall-detail').add()
            .tag({class:'foam.u2.tag.Image', data: 'images/red-arrow.png'})
            .start('h4').add('-', this.formattedPayableAmount$).end()
          .end()
        .end()
    },
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;

        var expensesInvoices = this.dao.where(this.EQ(this.Invoice.FROM_BUSINESS_ID, this.business.id))
        var payablesInvoices = this.dao.where(this.EQ(this.Invoice.TO_BUSINESS_ID, this.business.id))
        
        expensesInvoices.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.payableAmount = sum.value.toFixed(2);
        });

        payablesInvoices.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum){
          self.receivableAmount = sum.value.toFixed(2);
        })
      }
    }
  ]
});