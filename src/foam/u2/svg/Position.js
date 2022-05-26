/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg',
  name: 'Position',

  issues: [
    'applyAsTransform does not preserve existing transforms',
    'bindAsAttributes not yet implemented'
  ],

  properties: [
    { class: 'Int', name: 'x' },
    { class: 'Int', name: 'y' }
  ],

  methods: [
    function bind (element) {
      if ( element.nodeName === 'g' ) return this.bindAsTransform(element);
      if ( element.nodeName === 'rect' ) return this.bindAsAttributes(element);
      console.warn(
        `Cannot find foam.u2.svg.position to a "${element.nodeName}" tag; ` +
        'use a g, rect, or implement the missing functionality.');      
    },
    function bindAsTransform (element) {
      element.attrs({
        transform: this.slot(function (x, y) {
          return `translate(${x}, ${y})`;
        })
      });
    },
    function bindAsAttributes (element) {
      throw new Error('not yet implemented');
    }
  ]
});
