/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'ArrowHead',
  extends: 'foam.u2.Element',

  properties: [
    {
      name: 'nodeName',
      value: 'G'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.svg.Position',
      name: 'pos'
    },
    {
      name: 'angle',
      class: 'Float'
    },
    {
      name: 'size',
      class: 'Float'
    }
  ],
});

foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'SimpleArrowHead',
  extends: 'foam.u2.svg.arrow.ArrowHead',

  methods: [
    function render() {
      this.SUPER();
      var a1 = this.angle + Math.PI + Math.PI/4;
      var a2 = this.angle + Math.PI - Math.PI/4;
      this
        .start('line')
          .attrs({
            x1: this.pos.x$,
            y1: this.pos.y$,
            x2: this.pos.x$.map(x => x + Math.sin(a1) * this.size),
            y2: this.pos.y$.map(y => y + Math.cos(a1) * this.size),
            stroke: 'black' // TODO: prop
          })
        .end()
        .start('line')
          .attrs({
            x1: this.pos.x$,
            y1: this.pos.y$,
            x2: this.pos.x$.map(x => x + Math.sin(a2) * this.size),
            y2: this.pos.y$.map(y => y + Math.cos(a2) * this.size),
            stroke: 'black' // TODO: prop
          })
        .end()
        ;
    }
  ]
})