/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Grid',
  extends: 'foam.u2.Element',
  documentation: `
    A grid of responsive elements
  `,

  imports: [
    'displayWidth?'
  ],

  requires: [
    'foam.u2.layout.GUnit'
  ],

  css: `
    ^ {
      display: grid;
      grid-gap: 24px 12px;
    }
  `,

  listeners: [
    {
      name: 'resizeChildren',
      isFramed: true,
      code: function() {
        this.shown = false;
        var currentWidth = 0;
        this.childNodes.forEach(ret => {
          var cols = this.displayWidth ? this.displayWidth.cols : 12;
          var width = Math.min(this.GUnit.isInstance(ret) && ret.columns &&
            ret.columns[`${this.displayWidth.name.toLowerCase()}Columns`] ||
            cols, cols);

          var startCol = currentWidth + 1;
          currentWidth += width;

          if ( currentWidth > cols ) {
            startCol = 1;
            currentWidth = width;
          }

          var endCol = startCol + width;

          ret.style({
            'grid-column': `${startCol} / ${endCol}`
          });
        });
        this.shown = true;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.addClass();

      if ( this.displayWidth ) {
        this.onDetach(this.displayWidth$.sub(this.resizeChildren));
        this.style(
          { 'grid-template-columns': this.displayWidth$.map((dw) => {
              dw = dw || foam.u2.layout.DisplayWidth.XL;
              return `repeat(${dw.cols}, 1fr)`;
            })
          }
        );
        this.shown = false;
      }
    },

    function onAddChildren() {
      this.resizeChildren();
    }
  ]
});
