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
      value: 2000
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

            // securities and cash colouring are for the liquid accounts
            let color;
            if ( this.data.name.toLowerCase().includes('securities')) {
              color = '#406dea';
            } else if ( this.data.name.toLowerCase().includes('cash')) {
              color = '#d9170e';
            } else if ( type === 'Aggregate' ) {
              color = '#9ba1a6';
            } else {
              color  = denom ? denom.colour : '#ffffff';
            }

            this.add(this.Line.create({
              startX: -this.width/2+1,
              startY: 0,
              endX: -this.width/2+1,
              endY: this.height,
              color: color,
              lineWidth: 6
            }));

            const circleColour = balance && ! (type === 'Aggregate') ? '#32bf5e' : '#cbcfd4';
            this.add(foam.graphics.Circle.create({color: circleColour, x: this.width/2-14, y: this.height-14, radius: 5, border: null}));

            // Account Type
            if ( type == 'Digital' ) type = 'Virtual';
            this.add(this.Label.create({color: 'gray',  x: leftPos, y: 22, text: type + ' (' + denom ? denom.alphabeticCode : 'N/A' + ')'}));

            const balanceColour = type == 'Aggregate' ? 'gray' : 'black';
            const balanceFont   = type == 'Aggregate' ? '12px sans-serif' : 'bold 12px sans-serif';
            this.add(this.Label.create({
              color: balanceColour,
              font: balanceFont,
              x: leftPos,
              y: this.height-21,
              text$: this.homeDenomination$.map(_ =>  denom ? denom.format(balance) : 'N/A')
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
        'outline',
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

        function getOutline() {
          // for implementing dynamic programming
          if ( this.outline ) {
            return this.outline;
          }

          var outlineArray = [];

          if  ( this.childNodes.length === 0 ){
            outlineArray.push([this.left, this.right]);
            this.outline = outlineArray;
            return outlineArray;
          }

          const { childNodes } = this;


          var childOutlines = [];

          for ( let i = 0; i < childNodes.length; i++ ){
            childOutlines.push(childNodes[i].getOutline())
          }

          var mergedOutlines = this.mergeOutlines(childOutlines, childNodes);

          for ( let i = 0; i < mergedOutlines.length; i++ ){
            outlineArray.push(mergedOutlines[i]);  
          }

          // now we need to set the current level (first element) in the middle based on the outline of the first child
          this.left = (outlineArray[0][0] + outlineArray[0][1] - this.width) / 2;
          this.right = (outlineArray[0][0] + this.width + outlineArray[0][1] ) / 2;
          var currentLevel = [ this.left, this.right ];

          // moving the current level to the front of the outline array
          outlineArray.unshift(currentLevel);

          // going to memoize the outline
          this.outline = outlineArray;

          return outlineArray;
        },

        function mergeOutlines(outlines, childNodes){
          var mergedOutlines = [[]];
          var totalLevels = 1;

          /**
           * here we are getting the total amount of levels so that
           * we can later merge from the bottom up
           */
          for ( let i = 0; i < outlines.length; i++ ){
            const currentLevels = outlines[i].length;

            if ( currentLevels > totalLevels ) {
              totalLevels++;
              mergedOutlines.push([]);
            }
          }

          for ( let l = totalLevels - 1; l >= 0; l-- ){
            let levelLeft;
            let levelRight;

            /**
             * Here we are iterating through all the outlines from the bottom up
             * of the CURRENT OUTLINE, meaning the outlines will not always have
             * the same number of levels and so if that is the case we will skip 
             * them for that level
             */
            for ( let i = 0; i < outlines.length; i++ ){
              if ( outlines[i].length - 1 < l ) {
                continue;
              }

              let currentLeft = outlines[i][l][0];
              let currentRight = outlines[i][l][1];

              // keep assigning assigning as the level's right to account
              // for the situation when its the only node that goes down to that level
              // by the time it gets to the end of the outline array we will have the level right
              levelRight = currentRight;

              if ( i === 0 ) {
                levelLeft = currentLeft;
              } else {
                let previousRight = outlines[i - 1][l][1];
                if ( currentLeft <= previousRight + this.padding ){
                  const shift = previousRight - currentLeft + this.padding;
                  const shiftedOutline = this.pushApart(childNodes[i], shift);

                  // replace the current outline with the shifted outline and reset levelRight value
                  // so that the next outline can properly adjust for the push
                  outlines[i] = shiftedOutline;
                  levelRight = outlines[i][l][1];
                }
              }
            }

            mergedOutlines[l][0] = levelLeft;
            mergedOutlines[l][1] = levelRight;
          }

          return mergedOutlines;
        },


        function pushApart(root, shift){
          root.left += shift;
          root.x += shift;
          root.right += shift;

          const { childNodes, outline } = root;

          // iterate through outline array if exists and adjust for dynamic programming
          if ( outline ){
            for ( let i = 0; i < outline.length; i++ ){
              for ( let j = 0; j < outline[i].length; j++ ){
                outline[i][j] += shift;
              }
            }
          }
          
          // iterate through all children and shift as well
          for ( let i = 0; i < childNodes.length; i++ ){
            this.pushApart(childNodes[i], shift);
          }

          return root.outline;
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

          var childNodes = this.childNodes;
          var l          = childNodes.length;
          var moved      = false;

          for ( var pass = 0 ; pass < 50 ; pass++ ) {
            var movedNow = false;
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
              moved = movedNow = true;
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

            if ( ! movedNow ) return moved; 
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
          slot.set((2*slot.get() + newValue)/3);
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

            var x = (-this.maxLeft+25)/w * gw + 55;
            needsLayout = this.convergeTo(this.x$, x) || needsLayout;
            if ( this.layout() || needsLayout ) {
              this.doLayout();
            } else {
              this.graph.updateCWidth();
            }
            this.graph.invalidate();
          }
        }
      ]
    }
  ]
});
