
foam.CLASS({
  package: 'net.nanopay.b2b.ui.shared.summaryViews',
  name: 'MentionsView',
  extends: 'foam.u2.View',

  documentation: 'View displaying alerts & mentions',

  implements: [
    'foam.mlang.Expressions', 
  ],
  
  requires: [
    'net.nanopay.b2b.model.Invoice'
  ],

  imports: [ 'invoiceDAO', 'business', 'currencyFormatter' ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.invoiceDAO; }
    },
    {
      name: 'businessInvoiceDAO',
      expression: function(dao) {
        return dao.where(
          this.OR(
            this.EQ(this.Invoice.FROM_BUSINESS_ID, this.business.id),
            this.EQ(this.Invoice.TO_BUSINESS_ID, this.business.id)
          )
        );          
      }
    },
    {
      name: 'formattedMentionsAmount',
      expression: function(disputedAmount, pendingAmount) { 
        var a = disputedAmount + pendingAmount;
        return this.currencyFormatter.format(a); 
      }
    },
    {
      class: 'Double',
      name: 'disputedAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      name: 'formattedDisputedAmount',
      expression: function(disputedAmount) { return this.currencyFormatter.format(disputedAmount); }
    },
    {
      class: 'Double',
      name: 'pendingAmount',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      name: 'formattedPendingAmount',
      expression: function(pendingAmount) { return this.currencyFormatter.format(pendingAmount); }
    },
    'pendingCount',
    'draftCount',
    'disputedCount'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          margin-bottom: 20px;
        }
        ^ .net-nanopay-b2b-ui-shared-summaryViews-SummaryCard{
          width: 26.89%;
        }

      */}
    })
  ],

  messages: [
    { name: 'title', message: 'Mentions' },
    { name: 'disputeLabel',       message: 'Disputed' },
    { name: 'pendingLabel', message: 'Pending Approval' },
    { name: 'draftLabel',      message: 'Draft' }
  ],

  methods: [
    function initE() {
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('blue-card-title')
          .add(this.title)
          .start().addClass('thin-align').add(this.formattedMentionsAmount$).end()
        .end()
        .tag({ class: 'net.nanopay.b2b.ui.shared.summaryViews.SummaryCard', count: this.disputedCount$, amount: this.formattedDisputedAmount$, status: this.disputeLabel })
        .tag({ class: 'net.nanopay.b2b.ui.shared.summaryViews.SummaryCard', count: this.pendingCount$, amount: this.formattedPendingAmount$, status: this.pendingLabel })
        .tag({ class: 'net.nanopay.b2b.ui.shared.summaryViews.SummaryCard', count: this.draftCount$, amount: null, status: this.draftLabel })
    },
  ],

  listeners:[
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;

        var disputedDAO = this.businessInvoiceDAO.where(this.EQ(this.Invoice.STATUS, "Disputed"));

        disputedDAO.select(this.COUNT()).then(function(count) {
          self.disputedCount = count.value;
        });

        disputedDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.disputedAmount = sum.value.toFixed(2);
        });

        var pendingDAO = this.businessInvoiceDAO.where(this.EQ(this.Invoice.STATUS, "Pending"));

        pendingDAO.select(this.COUNT()).then(function(count) {
          self.pendingCount = count.value;
        });

        pendingDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.pendingAmount = sum.value.toFixed(2);
        });

        var draftDAO = this.businessInvoiceDAO.where(this.EQ(this.Invoice.STATUS, "Draft"));

        draftDAO.select(this.COUNT()).then(function(count) {
          self.draftCount = count.value;
        });
      }
    }
  ]
});
