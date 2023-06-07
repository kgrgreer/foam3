/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'StraightArrowLine',
  extends: 'foam.u2.svg.arrow.ArrowLine',

  methods: [
    function render() {
      console.log('i be rendererd')
      this.SUPER();
      this
        .start('line')
          .attrs({
            x1: this.startPos.x$,
            y1: this.startPos.y$,
            x2: this.endPos.x$,
            y2: this.endPos.y$,
            stroke: 'black' // TODO: prop
          })
        .end()
        ;
    }
  ]
});
