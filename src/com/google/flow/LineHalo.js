/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'LineHalo',
  extends: 'foam.graphics.Box',

  documentation: 'A simplified Halo for working with Lines.',

  exports: [
    'view',
    'anchorRadius'
  ],

  properties: [
    [ 'anchorRadius', 6 ],
    [ 'alpha', 0 ],
    [ 'border', null ],
    'selectedSub',
    { name: 'x1', expression: function() { return -this.anchorRadius; } },
    { name: 'x2', expression: function(width) { return this.width-this.anchorRadius; } },
    { name: 'y1', expression: function() { return -this.anchorRadius; } },
    { name: 'y2', expression: function(height) { return this.height-this.anchorRadius; } },
    {
      name: 'selected',
      postSet: function(_, n) {
        this.view = n && n.value;

        if ( this.selectedSub ) {
          this.selectedSub.detach();
          this.selectedSub = null;
        }

        this.parent && this.parent.remove(this);

        if ( com.google.flow.Line.isInstance(n.value) ) {
          var v = n.value;
          v.add(this);

          // Make the halo be the first child so that it will
          // get mouse touch and move events. Replace with
          // z-index when supported.
          v.children.pop(); v.children.unshift(this);

          this.alpha = 1;
          this.selectedSub = v.sub('propertyChange', this.onSelectedPropertyChange);
          this.onSelectedPropertyChange();
        } else {
          this.alpha = 0;
        }
      }
    },
    // TODO: maybe FLOW should bind 'view' instead of 'selected'
    {
      name: 'view'
    },
    'startX', 'startY', 'mouseStartX', 'mouseStartY'
  ],

  methods: [
    function init() {
      this.SUPER();

      var self = this;

      this.Anchor = com.google.flow.Halo.Anchor;

      this.add(
        this.Anchor.create({x$: this.x1$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.startX = vs.x + dx;
          v.startY = vs.y + dy;
        }}, this),
        this.Anchor.create({x$: this.x2$, y$: this.y2$, callback: function(v, vs, dx, dy) {
          console.log(this,v,vs,dx,dy);
//          debugger;
          v.endX = vs.endX + dx; // - self.anchorRadius;
          v.endY = vs.endY + dy; // - self.anchorRadius;
        }}, this)
      );
    },

    function paintChildren(x) {
      var alpha = x.globalAlpha;
      x.globalAlpha = 1.0
      this.SUPER(x);
      x.globalAlpha = alpha;
    }
  ],

  listeners: [
    {
      name: 'onSelectedPropertyChange',
      code: function() {
        var v = this.view;
        if ( ! v ) return;

        var r = this.anchorRadius;

        // this.x = v.startX;
        // this.y = v.startY;
        this.width  = v.endX - v.startX;
        this.height = v.endY - v.startY;
        /*
        if ( v.radius ) {
          this.height  = this.width = (v.radius + v.arcWidth + 3 + r*2) * 2;
          this.x       = - v.radius - v.arcWidth - r*2 - 3;
          this.y       = - v.radius - v.arcWidth - r*2 - 3;
          this.originX = v.x-this.x;
          this.originY = v.y-this.y;
        } else {
          this.x = this.y = -2*r-4;
          this.width      = v.scaleX * v.width  + 2 * ( r * 2 + 4 );
          this.height     = v.scaleY * v.height + 2 * ( r * 2 + 4 );
          this.originX    = v.originX+2*r+4
          this.originY    = v.originY+2*r+4;
        }
        */
      }
    },

    function onMouseDown(evt) {
      if ( ! this.view ) return;
      this.startX       = this.view.x;
      this.startY       = this.view.y;
      this.mouseStartX  = evt.offsetX;
      this.mouseStartY  = evt.offsetY;
    },

    function onMouseMove(evt) {
      if ( ! this.view ) return;
      this.view.x = this.startX + evt.offsetX - this.mouseStartX;
      this.view.y = this.startY + evt.offsetY - this.mouseStartY;
    }
  ]
});
