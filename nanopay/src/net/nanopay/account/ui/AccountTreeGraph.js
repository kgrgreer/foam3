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
      value: 10
    },
    {
      name: 'width',
      value: 1460
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
        this.homeDenomination$.sub(this.invalidate);

        // var isShadow = this.data.name.indexOf('Shadow') != -1;
        const leftPos  = -this.width/2+8;
        let type     = this.data.type.replace('Account', '');
        // Account Name
        this.add(this.Label.create({color: '#1d1f21', x: leftPos, y: 7, text: this.data.name, font: '500 12px sans-serif'}));

        // Balance and Denomination Indicator
        this.data.findBalance(this.__subContext__).then(function(balance) {
          this.__subContext__.currencyDAO.find(this.data.denomination).then(function(denom) {
            this.add(this.Line.create({
              startX: -this.width/2+1,
              startY: 0,
              endX: -this.width/2+1,
              endY: this.height,
              color: type === 'Aggregate' ? '#9ba1a6' : denom.colour,
              lineWidth: 6
            }));

            const circleColour = balance && ! (type === 'Aggregate') ? '#32bf5e' : '#cbcfd4';
            this.add(foam.graphics.Circle.create({color: circleColour, x: this.width/2-14, y: this.height-14, radius: 5, border: null}));

            // Account Type
            if ( type == 'Digital' ) type = 'Virtual';
            this.add(this.Label.create({color: 'gray',  x: leftPos, y: 22, text: type + ' (' + denom.alphabeticCode + ')'}));

            const balanceColour = type == 'Aggregate' ? 'gray' : 'black';
            const balanceFont   = type == 'Aggregate' ? '12px sans-serif' : 'bold 12px sans-serif';
            this.add(this.Label.create({
              color: balanceColour,
              font: balanceFont,
              x: leftPos,
              y: this.height-21,
              text$: this.homeDenomination$.map(_ =>  denom.format(balance))
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
      exports: [ 'as parentNode' ],

      properties: [
        'data',
        { name: 'height', factory: function() { return this.nodeHeight; } },
        { name: 'width',  factory: function() { return this.nodeWidth; } },
        [ 'border', 'gray' ],
        {
          name: 'childNodes',
          factory: function() { return []; }
        },
        [ 'left',  0 ],
        [ 'right', 0 ],
        [ 'maxLeft',  0 ],
        [ 'maxRight', 0 ],
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
        [ 'color', 'white' ]
      ],

      methods: [
        function initCView() {
          this.SUPER();

          this.formatNode();

          if ( this.relationship ) {
            var data = this.data.clone(this.__subContext__);

            try {
              data[this.relationship.forwardName].select(function(data) {
                this.addChildNode({data: data});
               }.bind(this));
             } catch(x) {}
             this.graph.doLayout();
           }
        },

        function paint(x) {
          if ( ! this.parentNode || this.parentNode.expanded ) this.SUPER(x);
        },

        function paintSelf(x) {
          x.save();

          if (this.useShadow){
            // Add shadow blur to box
            x.shadowBlur    = 5;
            x.shadowOffsetX = 5;
            x.shadowOffsetY = 5;
            x.shadowColor   = "gray";
          }

          x.translate(-this.width/2, 0);
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

          x.lineWidth   = 0.5; //this.borderWidth;
          x.strokeStyle = this.border;

          // Paint lines to childNodes
          if ( this.expanded && this.childNodes.length ) {
            var h = this.childNodes[0].y*3/4;
            var l = this.childNodes.length;

            line(0, this.height, 0, h);
            for ( var i = 0 ; i < l ; i++ ) {
              var c = this.childNodes[i];
              line(0, h, c.x, h);
              line(c.x, h, c.x, c.y);
            }
          }

          x.lineWidth = this.borderWidth;
          // Paint expand/collapse arrow
          if ( this.childNodes.length ) {
            var d = this.expanded ? 5 : -5;
            var y = this.height - 8;
            line(-5, y, 0, y+d);
            line(0, y+d, 5, y);
          }
        },

        function addChildNode(args) {
          var node = this.cls_.create(args, this);
          this.add(node);
          this.childNodes.push(node);
          this.graph.doLayout();
          return this;
        },

        function layout() {
          this.left = this.right = 0;

          if ( ! this.expanded ) return false;

          var moved      = false;
          var childNodes = this.childNodes;
          var l          = childNodes.length;

          // Layout children
          for ( var i = 0 ; i < l ; i++ ) {
            var c = childNodes[i];
            if ( c.y < this.height*2 ) { moved = true; c.y += 2; }

            if ( c.layout() ) moved = true;
            this.left  = Math.min(this.left, c.x);
            this.right = Math.max(this.right, c.x);
          }

          // Move children away from each other if required
          var m = l/2;
          for ( var i = 0 ; i < l-1 ; i++ ) {
            var n1 = childNodes[i];
            var n2 = childNodes[i+1];
            var d  = n2.x-n1.x+n2.left-n1.right;
            if ( d != this.width + this.padding ) {
              moved = true;
              var w = Math.min(Math.abs(this.width+this.padding-d), 10);
              if ( d > this.width + this.padding ) w = -w;
              if ( i+1 == m ) {
                n1.x -= w/2;
                n2.x += w/2;
              } else if ( i < Math.floor(m) ) {
                n1.x -= w;
              } else {
                n2.x += w;
              }
            }
          }
          // TODO/BUG: I'm not sure why this is necessary, but without, center
          // nodes are a few pixels off.
          if ( l%2 == 1 ) childNodes[Math.floor(m)].x = 0;

          // Calculate maxLeft and maxRight
          this.maxLeft = this.maxRight = 0;
          for ( var i = 0 ; i < l ; i++ ) {
            var c = childNodes[i];
            this.maxLeft  = Math.min(c.x + c.maxLeft, this.maxLeft);
            this.maxRight = Math.max(c.x + c.maxRight, this.maxRight);
          }

          return moved;
        },

        function convergeTo(slot, newValue) {
          /* Return true iff value was changed. */
          var delta = Math.abs(slot.get() - newValue);
          if ( delta < 0.001 ) {
            slot.set(newValue);
            return false;
          }
          slot.set(newValue);
          return true;
        }
      ],

      listeners: [
        {
          name: 'doLayout',
          isFramed: true,
          documentation: 'Animate layout until positions stabilize',
          code: function() {
            var needsLayout = false;
            // Scale and translate the view to fit in the available window
            var gw = this.graph.width-110;
            var w  = this.maxRight - this.maxLeft + 55;
            // if ( w > gw ) {
            //   var scaleX = Math.min(1, gw / w);
            //   needsLayout = this.convergeTo(this.scaleX$, scaleX) || needsLayout;
            // }

            var x = (-this.maxLeft+25)/w * gw + 55;
            needsLayout = this.convergeTo(this.x$, x) || needsLayout;
            if ( this.layout() || needsLayout ) this.doLayout();
            else {
              this.graph.updateCWidth();
            }
            this.graph.invalidate();
          }
        }
      ]
    }
  ]
});
