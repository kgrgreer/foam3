/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountSummaryView',
  extends: 'foam.u2.view.AltView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.view.TableView',
    'net.nanopay.account.Account',
    'net.nanopay.account.AggregateAccount'
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
          class: 'foam.u2.view.ScrollTableView',
          data: this.accountDAO
        }, 'Table'],
        [
          /*
            1. Aggregate and Shadow accounts have a clear background.
            2. Aggregate and zero balance accounts have a gray circle, otherwise green
            3. currency alphabetic code is displayed after account type
            4. aggregate account balances are shown in gray non-bold, otherwise black & bold
            5. open-closed indicator shown for accounts with children
          */
          function() {
            return {
              class: 'net.nanopay.account.ui.AccountTreeGraph',
              formatNode: function() {
                var isShadow = this.data.name.indexOf('Shadow') != -1;
                var leftPos  = -this.width/2+8;
                var type     = this.data.type.replace('Account', '');

                if ( isShadow || type == 'Aggregate' ) { this.color = '#edf0f5'; }
                // Account Name
                this.add(this.Label.create({color: 'black', x: leftPos, y: 7, text: this.data.name, font: 'bold 12px sans-serif'}));

                // Balance and Denomination Indicator
                this.data.findBalance(this.__subContext__).then(function(balance) {
                  this.__subContext__.currencyDAO.find(this.data.denomination).then(function(denom) {
                    var c = denom.color;
                    this.add(this.Line.create({
                      startX: -this.width/2+1,
                      startY: 0,
                      endX: -this.width/2+1,
                      endY: this.height,
                      color: c,
                      lineWidth: 4
                    }));
                    /*
                    this.add(this.Line.create({
                      startX: -this.width/2+1,
                      startY: 0,
                      endX: -this.width/2+1,
                      endY: this.height*.6,
                      color: 'rgba(255,255,255,0.5)',
                      lineWidth: 4
                    }));
                    */

                    var circleColour = balance && ! type == 'Aggregate' ? '#080' : '#ddd';
                    this.add(foam.graphics.Circle.create({color: circleColour, x: this.width/2-14, y: this.height-14, radius: 5, border: null}));

                    // Account Type
                    if ( type == 'Digital' ) type = 'Virtual';
                    this.add(this.Label.create({ color: 'gray', x: leftPos, y: 22, text: type + ' (' + denom.id + ')' }));

                    var balanceColour = type == 'Aggregate' ? 'gray' : 'black';
                    var balanceFont   = type == 'Aggregate' ? '12px sans-serif' : 'bold 12px sans-serif';
                    this.add(this.Label.create({ color: balanceColour, font: balanceFont, x: leftPos, y: this.height-21, text: denom.format(balance) }));
                  }.bind(this));
                }.bind(this));
              },
              nodeWidth: 185,
              nodeHeight: 80,
              padding: 10,
              width: 1350,
              height: 1000,
              x: 0,
              y: 0,
              relationship: net.nanopay.account.AccountAccountChildrenRelationship,
              data: this.AggregateAccount.create({ id: 0, name: ' ', denomination: 'CAD' })
          };
        }.bind(this),
          'Graph'
        ]
      ];
    }
  ]
});
