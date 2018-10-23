foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceListModal',
  extends: 'foam.u2.View',

  docuemntation: ``,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  imports: [
    'user'
  ],

  properties: [
    'type',
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAO',
      expression: function() {
        if ( this.type === 'payable' ) {
          return this.user.expenses;
        } else {
          return this.user.sales;
        }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function() {
        return this.myDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    }
  ],

  methods: [
    function initE() {
      this
        .select(this.filteredDAO$proxy, function(invoice) {
          return this.E().start({
            class: 'net.nanopay.sme.ui.InvoiceRowView',
            data: invoice
            })
            .on('click', function() {
                // TODO: redirect to InvoiceDetailModel
            })
            .end();
        });
    }
  ],
});
