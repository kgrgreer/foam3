foam.CLASS({
  package: 'net.nanopay.ingenico.ui.transaction',
  name: 'TransactionRowView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.ingenico.ui.transaction.TransactionDetailView'
  ],

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 70px;
          background-color: #ffffff;
          box-shadow: inset 0 -1px 0 0 #f2f2f2;
        }
        ^ .transaction-item {
          padding-left: 20px;
          padding-right: 20px;
        }
        ^ .transaction-item-icon img {
          position: absolute;
          height: 45px;
          width: 45px;
          border-style: solid;
          border-width: 1px;
          border-color: #f1f1f1;
          border-radius: 50%;
          margin-top: 13px;
          margin-bottom: 13px;
        }
        ^ .transaction-item-name {
          position: absolute;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1;
          text-align: left;
          color: #252c3d;
          padding-top: 22px;
          padding-bottom: 32px;
          padding-left: 65px;
        }
        ^ .transaction-item-datetime {
          position: absolute;
          font-family: Roboto;
          font-size: 10px;
          text-align: left;
          color: #666a86;
          padding-top: 41px;
          padding-bottom: 18px;
          padding-left: 65px;
        }
        ^ .transaction-item-amount {
          position: absolute;
          font-family: Roboto;
          font-size: 25px;
          text-align: right;
          color: #26a96c;
          padding-top: 22px;
          padding-bottom: 19px;
          padding-left: 217px;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('transaction-item')
          .start().addClass('transaction-item-icon')
            .tag({ class: 'foam.u2.tag.Image', data: this.data.image })
          .end()
          .start().addClass('transaction-item-name').add(this.data.name).end()
          .start().addClass('transaction-item-datetime').add(this.data.datetime).end()
          .start().addClass('transaction-item-amount').add(this.data.amount).end()
          .on('click', this.onClick)
        .end()
    }
  ],

  listeners: [
    function onClick (e) {
      this.stack.push(this.TransactionDetailView.create({ data: this.data }));
    }
  ]
})