foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'SingleItemView',
  extends: 'foam.u2.View',

  imports: ['addCommas'],

  properties: [
    'data'
  ],

  css: `
    ^table-header{
      width: 962px;
      height: 40px;
      background-color: rgba(110, 174, 195, 0.2);
      margin: 0;
    }
    ^ h3{
      width: 160px;
      display: inline-block;
      font-size: 12px;
      line-height: 1;
      font-weight: 500;
      text-align: center;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^table-body{
      width: 962px;
      height: auto;
      background: white;
      padding-bottom: 10px;
      margin: 0;
    }
    ^ p{
      display: inline-block;
      width: 90px;
    }
    ^table-body h3{
      font-weight: 300;
      font-size: 12px;
      margin-top: 25px;
    }
    ^table-body h4{
      font-weight: 300;
      font-size: 12px;
      margin-top: 25px;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div').addClass('invoice-detail')
          .start().addClass(this.myClass('table-header'))
            .start('h3').add('Transaction ID').end()
            .start('h3').add('Date').end()
            .start('h3').add('Sender').end()
            .start('h3').add('Amount').end()
            .start('h3').add('Receiver').end()
            .start('h3').add('Status').end()
          .end()
          .start().addClass(this.myClass('table-body'))
            .start('h3').add(this.data.id).end()
            .start('h3').add(this.data.created.toISOString()
              .substring(0, 10))
            .end()
            .start('h3')
              .add(this.data.payer ? this.data.payer.fullName : '')
            .end()
            .start('h3')
              .add('$', this.addCommas((this.data.total/100).toFixed(2)))
            .end()
            .start('h3')
              .add(this.data.payee ? this.data.payee.fullName : '')
            .end()
            .start('h3').add(this.data.status$.map(function(status) {
              return status.label;
            })).end()
          .end()
        .end();
    }
  ]
});
