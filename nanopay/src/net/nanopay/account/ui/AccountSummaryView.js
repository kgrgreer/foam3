foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountSummaryView',
  extends: 'foam.u2.view.AltView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.view.TableView',
    'net.nanopay.account.Account'
  ],

  imports: [
    'accountDAO'
  ],

  css: `
    ^ canvas {
      border: 1px solid black;
      margin-top: 20px;
    }
  `,

  methods: [
    function init() {
      this.views = [
        [{
          class: 'foam.u2.view.TableView',
          data: this.accountDAO
        }, 'Table'],
        [
          function() { return {
            class: 'net.nanopay.account.ui.AccountTreeGraph',
            formatNode: function() {
              var isShadow = this.data.name.indexOf('Shadow') != -1;
              if ( isShadow ) { this.color = '#ddd'; }
              // Account Name
              this.add(this.Label.create({color: 'black', x: -this.width/2+14, y: 7, text: this.data.name, font: 'bold 12px sans-serif'}));

              // Account Type
              var type = this.data.type.replace('Account', '');
              if ( type == 'Digital' ) type = 'Virtual';
              this.add(this.Label.create({color: 'gray',  x: -this.width/2+14, y: this.height-22, text: type}));

              // Balance and Denomination Indicator
              this.data.findBalance(this.__subContext__).then(function(balance) {
                this.__subContext__.currencyDAO.find(this.data.denomination).then(function(denom) {
                  var c = denom.color;
                  this.add(this.Line.create({
                    startX: -this.width/2+7,
                    startY: 5,
                    endX: -this.width/2+7,
                    endY: this.height-5,
                    color: c,
                    lineWidth: 4
                  }));

                  this.add(this.Label.create({color: 'gray',  x: this.width/2-4,  y: this.height-22, align: 'end', text: denom.format(balance)}));
                }.bind(this));
              }.bind(this));

            },
            nodeWidth: 165,
            padding: 10,
            width: 1350,
            height: 1000,
            x: 0,
            y: 0,
            relationship: net.nanopay.account.AggregateAccountAccountchildrenRelationship,
            data: net.nanopay.account.AggregateAccount.create({ id: 0, name: 'Temporal until Kevin fixes it', denomination: 'CAD' })
          }},
          'Graph'
        ]
      ];
    }
  ]
});
