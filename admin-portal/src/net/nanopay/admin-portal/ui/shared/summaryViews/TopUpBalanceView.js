
foam.CLASS({
  package: 'net.nanopay.admin.ui.shared.summaryViews',
  name: 'TopUpBalanceView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying top up balance',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.admin.model.TopUp',
    'foam.u2.dialog.Popup'
  ],

  imports: [ 'topUpDAO', 'currencyFormatter' ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.topUpDAO; }
    },
    {
      name: 'balance',
      class: 'Double',
      view: 'net.nanopay.admin.ReadOnlyCurrencyView'
    },
    {
      name: 'formattedBalance',
      expression: function(balance) { 
        return this.currencyFormatter.format(balance); 
      }
    },
    'show'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          margin-bottom: 60px;
          display: none;
        }

        .show {
          display: block;
        }
        
        ^ .net-nanopay-admin-ui-shared-summaryViews-SummaryCard {
          width: 40%;
          border-radius: 0px;
        }

        ^card-border {
          width: 6px;
          height: 120px;
          display: inline-block;
          z-index: 5;
          background-color: #5e91cb;
        }

        ^top-up-card {
          width: 15%;
          height: 120px;
          border-radius: 2px;
          background-color: #5e91cb;
          display: inline-grid;
          position: absolute;
          margin-left: -10px;
        }

        ^ .foam-u2-ActionView-topUp {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          text-align: center;
          color: #ffffff;
          background-color: transparent;
          border: none;
          outline: none;
          margin: auto;
        }

        ^ .foam-u2-ActionView-topUp:hover {
          background-color: transparent;
          background: transparent;
          border: none;
          outline: none;
        }

        ^ic-cashout {
          width: 32px;
          height: 30px;
          display: block;
          margin: auto;
          object-fit: contain;
          opacity: 0.9;
          padding-top: 24px;
        }
      */}
    })
  ],

  messages: [
    { name: 'balanceLabel',       message: 'Completed Top Ups' },
  ],

  methods: [
    function initE() {
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();
      var view = this;

      this
        .addClass(this.myClass())
        .enableClass('show', this.show$)
        .start('div').addClass(view.myClass('card-border')).end()
        .tag({ class: 'net.nanopay.admin.ui.shared.summaryViews.SummaryCard', amount: this.formattedBalance$, title: this.balanceLabel })
        .start('div')
          .addClass(view.myClass('top-up-card'))
          .start('div')
            .addClass(view.myClass('ic-cashout'))
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-cashout.svg' })
          .end()
          .add(view.TOP_UP)
        .end()
    },
  ],

  actions: [
    {
      name: 'topUp',
      label: 'Top Up',
      code: function() {
        this.add(foam.u2.dialog.Popup.create().tag({
          class: 'net.nanopay.admin.ui.topup.NewTopUp'
        }))
      }
    }
  ],

  listeners:[
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        var expr = foam.mlang.Expressions.create();

        self.dao.select(expr.SUM(self.TopUp.AMOUNT))
            .then(function(g) {
                self.balance = g.value.toFixed(2);
                self.show = g.value;
            });
      }
    }
  ]
});
