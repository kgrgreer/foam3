foam.CLASS({
  package: 'net.nanopay.bank.ui',
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
      height: 60px;
      border-radius: 2px;
      margin-top: 20px;
    }
    ^ .light-roboto-h2{
      margin: 20px 0 0 20px;
    }

    ^ .foam-u2-view-TableView {
      width: 992px;
      table-layout: fixed;
      border-collapse: collapse;
    }
      
    ^ th, td {
      padding: 5px;
      text-align: left;
    }
    
    ^ tr {
      display: block;
      position: relative;
    }
    ^ tbody {
      display: block;
      overflow: auto;
      width: 100%;
      height: 200px;
    }
  `,

  messages: [
    { name: 'title', message: 'Low Balance Alerts'}
  ],

  methods: [
    function initE(){
      this.SUPER()

      v = net.nanopay.model.Threshold.create({ thresholdName: 'Threshold', balance: 1000 })
      this.thresholdDAO.put(v)
      t = net.nanopay.model.BalanceAlert.create({ bank: this.user, threshold: 1 })
      this.user.balanceAlerts.put(t)
      this
      .addClass(this.myClass())
      .start().addClass('float-left light-roboto-h2')
        .add(this.title)
      .end()
      .start()
        .add(this.AlertTableView.create())
      .end();
    }
  ],

  classes: [
    {
      name: 'AlertTableView',
      extends: 'foam.u2.View',
      
      imports: [ 'user' ],

      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.user.balanceAlerts }}
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
            }).end()
        }
      ]
    }
  ]
});