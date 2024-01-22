/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Grid',
  extends: 'foam.u2.Element',
  mixins: ['foam.u2.layout.ContainerWidth'],

  documentation: 'A grid of responsive elements',

  requires: [
    'foam.u2.layout.GUnit'
  ],

  css: `
    ^ {
      display: grid;
      grid-gap: 24px 12px;
    }
  `,

  methods: [
    async function render() {
      this.SUPER();
      this.addClass();
      this.initContainerWidth();
      this.onDetach(this.containerWidth$.sub(this.resizeChildren));
      this.style(
        { 'grid-template-columns': this.containerWidth$.map(dw => {
            dw = dw || foam.u2.layout.DisplayWidth.XL;
            return `repeat(${dw.cols}, 1fr)`;
          })
        }
      );
    },

    function add_() {
      this.SUPER(...arguments);
      this.resizeChildren();
      return this;
    }
  ],

  listeners: [
    {
      name: 'resizeChildren',
      isFramed: true,
      code: function() {
        this.shown = false;
        var currentWidth = 0;
        this.children.forEach(ret => {
          var cols = 12, width = 12;
          if ( this.containerWidth ) {
            cols = this.containerWidth.cols;
            width = Math.min(this.GUnit.isInstance(ret) && ret.columns &&
              ret.columns[`${this.containerWidth.name.toLowerCase()}Columns`] ||
              cols, cols);
          }
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
  ]
});
