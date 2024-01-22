/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'ContainerWidth',
  documentation: 'Intended to be used with ResizeObserver',

  properties: [
    {
      name: 'containerWidth',
      class: 'FObjectProperty',
      of: 'foam.u2.layout.DisplayWidth'
    }
  ],

  methods: [
    function initContainerWidth(el) {
      el = el || this;
      let ro = new ResizeObserver(this.updateWidth);
      el.el().then(o => {
        ro.observe(o);
      });
    }
  ],

  listeners: [
    function updateWidth(entries) {
      if ( entries.length > 1 ) console.warn('ContainerWidth called with mutiple observe targets');
      for ( const entry of entries ) {
        let width = entry.target.getBoundingClientRect().width;
        this.containerWidth = foam.u2.layout.DisplayWidth.VALUES
        .concat()
        .sort((a, b) => b.minWidth - a.minWidth)
        .find(o => o.minWidth <= Math.min(width) );
      }
    }
  ]
});
