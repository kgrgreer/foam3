foam.CLASS({
  package: 'net.nanopay.admin.ui.topup',
  name: 'TopUpView',
  extends: 'foam.u2.View',

  documentation: 'Top Up View',

  implements: [
    'foam.mlang.Expressions', 
  ],

  exports: [ 'as data' ],

  imports: [
    'stack', 'topUpDAO'
  ],

  requires: [
    'foam.comics.DAOCreateControllerView',
    'net.nanopay.admin.model.TopUp'
  ],

  properties: [
    'selection', 
    { name: 'data', factory: function() { return this.topUpDAO; }}
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ p{
        display: inline-block;
      }

      ^pending-top-ups {
        opacity: 0.6;
        font-family: Roboto;
        font-size: 24px;
        font-weight: 300 !important;
        line-height: 1.0;
        letter-spacing: 0.3px;
        color: #093649;
        padding-bottom: 30px;
      }

      ^container {
        width: 95%;
        position: relative;
        vertical-align: top;
        overflow: auto;
        z-index: 0;
        display: block;
        margin: auto;
        margin-top: 30px;
      }

      ^container th {
        background-color: rgba(94, 145, 203, 0.4);
        font-family: Roboto;
        font-size: 16px;
        font-weight: normal;
        line-height: 1.0;
        letter-spacing: 0.3px;
        color: #093649;
        padding-left: 65px;
        text-align: left;
      }

      ^container td {
        width: 33%;
        padding-left: 65px;
        text-align: left;
        font-size: 14px;
      }

      .foam-u2-view-TableView-th-amount {
        text-align: left !important;
      }

      ^no-pending-top-ups {
        font-family: Roboto;
        font-size: 14px;
        letter-spacing: 0.2px;
        color: #093649;
        text-align: center;
        display: block;
        padding: 30px;
      }
    */}
    })
  ],

  messages: [
    {
      name: 'placeholderText',
      message: 'Please add your first bank account to top up.'
    },
    {
      name: 'placeholderButtonText',
      message: 'Add Bank Account'
    },
    {
      name: 'noPendingTopUps',
      message: 'No pending top ups.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var view = this;
      this
        .addClass(view.myClass())
        .tag({ 
          class: 'net.nanopay.admin.ui.shared.EmptySlate',
          dao: this.topUpDAO,
          message: this.placeholderText,
          buttonText: this.placeholderButtonText
        })
        .start('div')
          .addClass(view.myClass('container'))
          .tag({ class: 'net.nanopay.admin.ui.shared.summaryViews.TopUpBalanceView' })
          .start('h1').addClass(view.myClass('pending-top-ups')).add('Pending Top Ups').end()
          .tag(this.TopUpTableView)
          .start('span')
            .addClass(view.myClass('no-pending-top-ups'))
            .add(view.slot(function(count) {
                return count.value == 0 ? view.noPendingTopUps : '';
              }, view.daoSlot(this.topUpDAO, this.COUNT())))
          .end()
        .end()
    }
  ],

  classes: [
    {
      name: 'TopUpTableView',
      extends: 'foam.u2.View',
      
      requires: [ 'net.nanopay.admin.model.TopUp' ],
      imports: [ 'topUpDAO' ],

      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.topUpDAO; }}
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              columns: [
                'issueDate', 'amount', 'expectedDate'
              ],
            }).end()
        },
      ]
    }
  ]
});
