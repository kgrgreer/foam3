foam.CLASS({
  package: 'net.nanopay.invoice.ui.shared',
  name: 'SingleItemView',
  extends: 'foam.u2.View',

  imports: [
    'user'
  ],

  properties: [
    'data',
    {
      name: 'type',
      expression: function(data, user){
        return user.id != data.payeeId
      }
    },
    {
      name: 'statusClassName',
      expression: function(data){
        return 'Invoice-Status-'+  data.status;
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^table-header{
          width: 960px;
          height: 40px;
          background-color: rgba(110, 174, 195, 0.2);
          padding-bottom: 10px;
        }
        ^ h3{
          width: 150px;
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          font-weight: 500;
          text-align: center;
          color: #093649;
        }
        ^ h4{
          width: 150px;
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          font-weight: 500;
          text-align: center;
          color: #093649;
        }
        ^table-body{
          width: 960px;
          height: auto;
          background: white;
          padding: 10px 0;
        }
        ^ p{
          display: inline-block;
          width: 90px;
        }
        ^table-body h3{
          font-weight: 300;
          font-size: 12px;
        }
        ^table-body h4{
          font-weight: 300;
          font-size: 12px;
        }
        */
      }
    })
  ],

  methods: [
    function initE(){
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass('invoice-detail')
          .start().addClass(this.myClass('table-header'))
            .start('h3').add('Invoice #').end()
            .start('h3').add('PO #').end()
            .call(function(){
              self.type ? this.start('h3').add('Vendor').end() : this.start('h3').add('Customer').end()
            })
            .start('h4').add('Date Due').end()
            .start('h4').add('Amount').end()
            .start('h3').add('Status').end()
          .end()
          .start().addClass(this.myClass('table-body'))
            .start('h3').add(this.data.invoiceNumber).end()
            .start('h3').add(this.data.purchaseOrder).end()
            .start('h3').add(this.type ? this.data.payeeName : this.data.payerName).end()
            .start('h4').add(this.data.dueDate ? this.data.dueDate.toISOString().substring(0,10) : '').end()
            .start('h4').add('$', this.data.amount.toFixed(2)).end()
            .start('h3')
              .add(this.data$.dot('status').map(function(a){                    
                return self.E().add(a).addClass('generic-status Invoice-Status-' + a);
              }))
          .end()
        .end()
    }
  ]
});