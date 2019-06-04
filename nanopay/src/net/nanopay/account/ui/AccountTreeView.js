foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountTreeView',
  extends: 'net.nanopay.account.ui.AccountTreeGraph',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.view.TableView',
    'net.nanopay.account.Account',
    'net.nanopay.account.AggregateAccount',
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

  properties: [
    { 
      name: 'nodeWidth',
      value: 185
    },
    {
      name: 'nodeHeight',
      value: 80
    },
    {
      name: 'padding', 
      value: 10
    },
    {
      name: 'width',
      value: 1350
    },
    {
      name: 'height',
      value:1000
    },
    {
      name: 'x', 
      value: 0
    },
    {
      name: 'y',
      value: 0
    },
    {
      name: 'relationship',
      factory: function() {
        return net.nanopay.account.AccountAccountChildrenRelationship;
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.AggregateAccount.create({ id: 0, name: ' ', denomination: 'CAD' });
      }
    },
    {
      name: 'formatNode',
      value: function() {
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

          var circleColour = balance && ! type == 'Aggregate' ? '#080' : '#ddd';
          this.add(foam.graphics.Circle.create({color: circleColour, x: this.width/2-14, y: this.height-14, radius: 5, border: null}));

          // Account Type
          if ( type == 'Digital' ) type = 'Virtual';
          this.add(this.Label.create({color: 'gray',  x: leftPos, y: 22, text: type + ' (' + denom.alphabeticCode + ')'}));

          var balanceColour = type == 'Aggregate' ? 'gray' : 'black';
          var balanceFont   = type == 'Aggregate' ? '12px sans-serif' : 'bold 12px sans-serif';
          this.add(this.Label.create({color: balanceColour, font: balanceFont, x: leftPos,  y: this.height-21, text: denom.format(balance)}));
        }.bind(this));
      }.bind(this));
    }}
  ],
});
