foam.CLASS({
  package: 'net.nanopay.liquidity.ui',
  name: 'BalanceAlertView',
  extends: 'foam.u2.View',

  documentation: 'View displaying bank balance alerts based on passed thresholds.',

  imports: [
    'user',
    'thresholdDAO',
    'balanceAlertDAO'
  ],

  css: `
    ^ {
      width: 100%;
      background: white;
      height: 300px;
      padding-bottom: 25px;
      border-radius: 2px;
      margin-top: 20px;
    }
    ^ .light-roboto-h2{
      margin: 20px 0 0 20px;
    }

    ^ .foam-u2-view-TableView {
      width: 950px;
      table-layout: fixed;
      border-collapse: collapse;
      position: relative;
      top: 30px;
    }
    ^ tr {
      display: block;
      position: relative;
    }
    ^ th {
      width: 500px;
    }
    ^ .foam-u2-view-TableView-th-editColumns{
      width: 0;
    }
    ^ tbody {
      display: block;
      overflow: auto;
      width: 100%;
      height: 180px;
    }
    ^ tbody > tr > td {
      width: 900px;
    }
    ^ tbody > tr > td:last-child {
      width: 0;
    }
    ^ tbody > tr {
      padding-top: 20px;
      height: 40px;
    }
    ^ .net-nanopay-ui-Placeholder-placeholder-container{
      position: relative;
      top: -100px;
      right: -50px;
      margin: 0;
    }
  `,

  messages: [
    { name: 'title', message: 'Low Balance Alerts'},
    { name: 'placeholderText', message: 'You have no balance alerts.'}
  ],

  methods: [
    function initE(){
      this.SUPER()
      this
      .addClass(this.myClass())
      .start().addClass('float-left').addClass('light-roboto-h2')
        .add(this.title)
      .end()
      .start()
        .add(this.AlertTableView.create())
      .end()
      .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.user.balanceAlerts, message: this.placeholderText, image: 'images/ic-payable.png' });
    }
  ],

  classes: [
    {
      name: 'AlertTableView',
      extends: 'foam.u2.View',
      
      imports: [ 'user' ],

      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.user.balanceAlerts; }}
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
                'bankName', 'balance', 'minBalance', 'status'
              ],
            }).end();
        }
      ]
    }
  ]
});