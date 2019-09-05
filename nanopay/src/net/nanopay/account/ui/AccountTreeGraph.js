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
      name: 'width',
      value: 1600
    },
    {
      name: 'height',
      value: 1000
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
      postSet: function (o, n) {
        if (o) {
          o.color = 'white';
        }
        n.color = this.selectedColor
          ;
      }
    },
    {
      name: 'relationship',
      factory: function () {
        return net.nanopay.account.AccountAccountChildrenRelationship;
      }
    },
    {
      name: 'data',
      factory: function () {
        return this.AggregateAccount.create({ id: 0, name: ' ', denomination: 'CAD' });
      }
    },
    {
      name: 'formatNode',
      value: function () {
        this.homeDenomination$.sub(this.invalidate);

        // var isShadow = this.data.name.indexOf('Shadow') != -1;
        const leftPos = -this.width / 2 + 8;
        let type = this.data.type.replace('Account', '');
        // Account Name
        this.add(this.Label.create({ color: '#1d1f21', x: leftPos, y: 7, text: this.data.name, font: '500 12px sans-serif' }));

        // Balance and Denomination Indicator
        this.data.findBalance(this.__subContext__).then(function (balance) {
          this.__subContext__.currencyDAO.find(this.data.denomination).then(function (denom) {

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
              text$: this.homeDenomination$.map(_ => denom ? denom.format(balance) : 'N/A')
            }))
          }.bind(this));
        }.bind(this));
      }
    }
  ],

  classes: [
    {
      name: 'Node',
      extends: 'foam.graphics.Box',

      requires: [
        'foam.graphics.Box',
        'foam.graphics.CView',
        'foam.graphics.Label',
        'foam.graphics.Line'
      ],

      imports: [
        'formatNode',
        'graph',
        'nodeHeight',
        'nodeWidth',
        'padding',
        'parentNode?',
        'relationship',
        'homeDenomination'
      ],
      exports: ['as parentNode'],

      properties: [
        'data',
        {
          name: 'outline',
          expression: function (x, nodeWidth, expanded, childNodes, padding) {
            var nodeLeftEdgePadded = x - nodeWidth / 2 - padding / 2;
            var nodeRightEdgePadded = x + nodeWidth / 2 + padding / 2;
            var rootLevelOutline = [
              {
                left: nodeLeftEdgePadded,
                right: nodeRightEdgePadded
              }
            ];

            var champion = [];

            for (let i = 0; i < childNodes.length && expanded; i++) {
              // get child outline
              // transform all rows
              // merge levels into childoutlines
              var childOutline = childNodes[i].outline.map(o => ({
                left: o.left + x,
                right: o.right + x,
              }));

              for (var j = 0; j < childOutline.length; j++) {
                champion[j] = champion[j] || {};
                champion[j].left = Math.min(childOutline[j].left, champion[j].left  || Number.MAX_SAFE_INTEGER );
                champion[j].right = Math.max(childOutline[j].right, champion[j].right || Number.MIN_SAFE_INTEGER );
              }
            }

            var totalOutline = rootLevelOutline.concat(champion);

            return totalOutline;
          }
        },
        { name: 'height', factory: function () { return this.nodeHeight; } },
        { name: 'width', factory: function () { return this.nodeWidth; } },
        ['border', 'gray'],
        {
          name: 'childNodes',
          factory: function () { return []; }
        },
        ['left', 0],
        ['right', 0],
        ['maxLeft', 0],
        ['maxRight', 0],
        {
          class: 'Boolean',
          name: 'expanded',
          value: true
        },
        {
          class: 'Boolean',
          name: 'useShadow',
          value: false
        },
        ['color', 'white']
      ],

      methods: [
        function initCView() {
          this.SUPER();

          this.formatNode();

          if (this.relationship) {
            var data = this.data.clone(this.__subContext__);

            try {
              data[this.relationship.forwardName].select(function (data) {
                this.addChildNode({ data: data });
              }.bind(this));
            } catch (x) { }
            this.graph.doLayout();
          }
        },

        function paint(x) {
          if (!this.parentNode || this.parentNode.expanded) this.SUPER(x);
        },

        function paintSelf(x) {
          x.save();

          if (this.useShadow) {
            // Add shadow blur to box
            x.shadowBlur = 5;
            x.shadowOffsetX = 5;
            x.shadowOffsetY = 5;
            x.shadowColor = "gray";
          }

          x.translate(-this.width / 2, 0);
          this.SUPER(x);

          // reset translate and shadow settings
          x.restore();

          this.paintConnectors(x);
        },

        function paintConnectors(x) {
          function line(x1, y1, x2, y2) {
            x.beginPath();
            x.moveTo(x1, y1);
            x.lineTo(x2, y2);
            x.stroke();
          }

          x.lineWidth = 0.5; //this.borderWidth;
          x.strokeStyle = this.border;

          // Paint lines to childNodes
          if (this.expanded && this.childNodes.length) {
            var h = this.childNodes[0].y * 3 / 4;
            var l = this.childNodes.length;

            line(0, this.height, 0, h);
            for (var i = 0; i < l; i++) {
              var c = this.childNodes[i];
              line(0, h, c.x, h);
              line(c.x, h, c.x, c.y);
            }
          }

          x.lineWidth = this.borderWidth;
          // Paint expand/collapse arrow
          if (this.childNodes.length) {
            var d = this.expanded ? 5 : -5;
            var y = this.height - 8;
            line(-5, y, 0, y + d);
            line(0, y + d, 5, y);
          }
        },

        function addChildNode(args) {
          var node = this.cls_.create(args, this);
          node.y = this.height * 2;
          this.add(node);
          this.childNodes = this.childNodes.concat(node);
          node.outline$.sub(() => {
            this.outline = [];
            this.outline = undefined
          });
          return this;
        },

        function distanceTo(node) {
          var outlineA = this.outline;
          var outlineB = node.outline;
          minLevels = Math.min(outlineA.length, outlineB.length);

          var champion = Number.MAX_SAFE_INTEGER;
          for (var i = 0; i < minLevels; i++) {
            // we only need to check if the right of outlineA overlaps with the left of outlineB
            var overlapDistance = outlineB[i].left - outlineA[i].right;

            champion = Math.min(champion, overlapDistance);
          }
          return champion;
        },

        function layout() {
          //console.log(this.data.name);
          const { childNodes } = this;
          var moved = false;

          for ( var i = 0; i < childNodes.length; i++ ) {
            var n1 = childNodes[i];

            for ( var j = i + 1; j < childNodes.length; j++ ){
              var n2 = childNodes[j];

              var distance = n1.distanceTo(n2);

              if ( distance < 0 ) {
                n2.x -= distance;
                moved = true;
              }
            }
          }

          for ( var i = 0; i < childNodes.length; i++ ){
            if ( childNodes[i].layout() ) moved = true;
          }

          // FIXME: center parent above children
          if ( childNodes.length > 1 ){
            var leftmostChild = childNodes[0];
            var rightmostChild = childNodes[childNodes.length - 1];
            this.x += (leftmostChild.x + rightmostChild.x) / 2;
          }
          
          return moved;
        },

        function findNodeAbsoluteXByName(name, compound) {
          if (this.data.name === name) {
            this.graph.selectedNode = this;
            return this.x + compound;
          }

          var childNodes = this.childNodes;
          for (var i = 0; i < childNodes.length; i++) {
            var foundNode = childNodes[i].findNodeAbsoluteXByName(name, this.x + compound);
            if (foundNode) {
              return foundNode;
            }
          }
        }
      ],
    }
  ]
});
