foam.CLASS({
    package: 'net.nanopay.invoice.ui.history',
    name: 'InvoiceApprovedHistoryItemView',
    extends: 'foam.u2.View',
  
    implements: [
      'foam.u2.history.HistoryItemView',
      'net.nanopay.invoice.util.InvoiceHistoryUtility'
    ],
 
    requires: [
      'net.nanopay.invoice.model.Invoice'
    ],
  
    documentation: 'View for displaying approved date on invoice history',
  
    imports: [
      'invoiceDAO',
      'userDAO',
      'user'
    ],
  
    properties: [
      'name'
    ],
  
    css: `
      ^ .iconPosition {
        width: 10px;
        height: 10px;
        border-radius: 50px;
        background-color: #2e227f;
        margin-left: -1px;
      }
      ^ .statusBox {
        height: 100px;
        margin-top: -20px;
        padding-bottom: 22px;
      }
      ^ .statusContent {
        padding-left: 40px;
      }
      ^ .statusDate {
        font-family: Roboto;
        font-size: 8px;
        line-height: 1.33;
        letter-spacing: 0.1px;
        color: #a4b3b8;
        top: 5px;
        position: relative;
      }
      ^ .statusTitle {
        font-family: Roboto;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.2px;
        color: /*%BLACK%*/ #1e1f21;
      }
    `,
  
    methods: [
      async function outputRecord(parentView, record) {
        var self = this;
        var invoice = await this.invoiceDAO.find(record.objectId);
         // check which name should use agent name or business name
        this.name = this.getDisplayName(record, this.user, invoice);
  
        return parentView
          .addClass(this.myClass())
          .style({ 'padding-left': '20px' })
          .start('div').addClass('iconPosition')
          .end()
          .start('div').addClass('statusBox')
            .start('div')
              .style({ 'padding-left': '30px' })
              .start('span').addClass('statusTitle')
                .add('Invoice was approved')
              .end()
            .end()
            .start('div')
              .style({ 'padding-left': '30px' })
              .start('span').addClass('statusDate')
                .add(`${this.formatDate(record.timestamp)} by ${self.name}`)
              .end()
            .end()
          .end();
      }
    ]
  });
