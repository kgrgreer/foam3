/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountTreeGraph',
  extends: 'foam.graphics.TreeGraph',

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
      value: 30
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
      name: 'selectedColor',
      value: 'rgb(135,206,250,0.15)'
    },
    {
      name: 'selectedNode',
      postSet: function(o, n) {
        if (o) {
          o.color = 'white';
        }
        n.color = this.selectedColor;
      }
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
        this.__subContext__.homeDenomination$.sub(this.invalidate);

        // var isShadow = this.data.name.indexOf('Shadow') != -1;
        const leftPos = -this.width / 2 + 8;
        let type = this.data.type.replace('Account', '');
        // Account Name
        this.add(this.Label.create({ color: '#1d1f21', x: leftPos, y: 7, text: this.data.name, font: '500 12px sans-serif' }));

        // Balance and Denomination Indicator
        this.data.findBalance(this.__subContext__).then(balance => {
          this.__subContext__.currencyDAO.find(this.data.denomination).then(denom => {

            // securities and cash colouring are for the liquid accounts
            let color;
            if (this.data.name.toLowerCase().includes('securities')) {
              color = '#406dea';
            } else if (this.data.name.toLowerCase().includes('cash')) {
              color = '#d9170e';
            } else if (type === 'Aggregate') {
              color = '#9ba1a6';
            } else {
              color = denom ? denom.colour : '#ffffff';
            }

            this.add(this.Line.create({
              startX: -this.width / 2 + 1,
              startY: 0,
              endX: -this.width / 2 + 1,
              endY: this.height,
              color: color,
              lineWidth: 6
            }));

            const circleColour = balance && !(type === 'Aggregate') ? '#32bf5e' : '#cbcfd4';
            this.add(foam.graphics.Circle.create({ color: circleColour, x: this.width / 2 - 14, y: this.height - 14, radius: 5, border: null }));

            // Account Type
            if (type == 'Digital') type = 'Virtual';
            this.add(this.Label.create({ color: 'gray', x: leftPos, y: 22, text: type + ' (' + denom ? denom.alphabeticCode : 'N/A' + ')' }));

            const balanceColour = type == 'Aggregate' ? 'gray' : 'black';
            const balanceFont = type == 'Aggregate' ? '12px sans-serif' : 'bold 12px sans-serif';
            this.add(this.Label.create({
              color: balanceColour,
              font: balanceFont,
              x: leftPos,
              y: this.height - 21,
              text$: this.__subContext__.homeDenomination$.map(_ => denom ? denom.format(balance) : 'N/A')
            }))
          });
        });
      }
    }
  ]
});
