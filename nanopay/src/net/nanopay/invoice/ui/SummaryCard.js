
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SummaryCard',
  extends: 'foam.u2.View',

  documentation: 'Cards for summary views',

  imports: [ 
    'formatCurrency' 
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          display: inline-block;
          width: 20%;
          background: white;
          height: 100px;
          vertical-align: top;
          margin-left: 6px;
          border-radius: 3px;
          overflow: hidden;
        }
        ^ .Pending{
          width: 105px;
          height: 15px;
          border-radius: 100px;
          border: solid 1px #093649;
          color: #093649;
          padding: 3px 3px 3px 15px;
        }
        ^ .Overdue{
          color: white;
          background: #c82e2e;
          border-radius: 100px;
          height: 18px;
          padding-left: 10px;
          padding-top: 5;
          width: 55px;
        }
        ^ .Disputed{
          width: 60px;
          height: 15px;
          padding: 3px 3px 3px 15px;
          border-radius: 100px;
          border: solid 1px #c82e2e;  
          color: #c82e2e;
        }
        ^ .Paid{
          width: 35px;
          height: 15px;
          padding: 3px 3px 3px 15px;
          border-radius: 100px;
          background: #2cab70;
          color: white;
        }
        ^ .Scheduled{
          color: #2cab70;
          width: 66px;
          height: 18px;
          border: 1px solid #2cab70;
          border-radius: 100px;
          padding: 3px 0 0 10px;
        }

        ^ .New{
          color: #59a5d5;
          width: 40px;
          height: 18px;
          border: 1px solid #59a5d5;
          border-radius: 100px;
          padding: 3px 0 0 15px;
        }
        ^ .Due{
          color: white;
          background: #59aadd;
          border-radius: 100px;
          width: 30px;
          height: 18px;
          padding-left: 10px;
          padding-top: 5;
        }
        ^ .label{
          position: relative;
          top: 35;
          left: 10;
          font-size: 12px;
        }
        ^ .count{
          font-size: 30px;
          font-weight: 300;
          line-height: 1;
          position: relative;
          top: 20;
          left: 20;
        }
        ^ .amount{
          line-height: 0.86;
          text-align: left;
          color: #093649;
          opacity: 0.6;
          float: right;
          margin-right: 15px;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'formattedAmount',
      expression: function(amount) { return this.formatCurrency(amount/100); }
    },
    'amount',     
    'count',
    'status'
 ],

  methods: [
    function initE(){
      var self = this;
      this
        .addClass(this.myClass())
          .start().addClass('count').add(this.count$).end()
          .start().addClass('amount').add(this.formattedAmount$).end()
          .start().addClass(this.status + ' label special-status-tag').add(this.status).end()
        .end()
    },
  ]
});
