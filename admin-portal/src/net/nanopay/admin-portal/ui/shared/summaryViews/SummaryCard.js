
foam.CLASS({
  package: 'net.nanopay.admin.ui.shared.summaryViews',
  name: 'SummaryCard',
  extends: 'foam.u2.View',

  documentation: 'Cards for summary views',

  implements: [
    'net.nanopay.util.CurrencyFormatter'    
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          display: inline-block;
          width: 20%;
          background: white;
          height: 120px;
          position: relative;
          vertical-align: top;
          margin-right: 6px;
          border-radius: 3px;
          overflow: hidden;
          font-size: 12px;
        }

        ^ .title{
          padding-top: 14px;
          padding-left: 53px;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          color: #14375d;
        }
        
        ^ .amount{
          padding-left: 53px;
          padding-top: 27px;
          font-family: Roboto;
          font-size: 34px;
          font-weight: 300;
          line-height: 1.0;
          letter-spacing: 0.5px;
          color: #093649;
        }
      */}
    })
  ],

  properties: [
    'amount', 
    {
      name: 'formattedAmount', expression: function(amount) { return this.currencyFormatter.format(amount); }
    },
    'title'
 ],

  methods: [
    function initE(){
      var self = this;
      this
        .addClass(this.myClass())
          .start().addClass('title').add(this.title$).end()
          .start().addClass('amount').add(this.formattedAmount$).end()
        .end()
    },
  ]
});
