/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadOnlyEnumView',
  extends: 'foam.u2.View',

  requires: ['foam.u2.tag.CircleIndicator'],

  imports: ['returnExpandedCSS', 'theme'],

  css: `
    ^pill{
      align-items: center;
      border-radius: 11.2px;
      border: 1px solid;
      display: inline-flex;
      justify-content: space-around;
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: normal;
      line-height: 2.1em;
      min-width: 88px;
      padding: 0 12px;
      text-align: center;
      width: -webkit-max-content;
      width: -moz-max-content;
    }
    ^icon{
      margin-right: 4px;
    }
  `,

  documentation: 'Creates badges with rounded/squared sides based on display context',

  properties: [
    {
      class: 'Boolean',
      name: 'showGlyph'
    }
  ],

  methods: [
    function render() {
      var data = this.data;
      this.SUPER();
      var color = this.returnExpandedCSS(this.data.color);
      var background = this.returnExpandedCSS(this.data.background);
      var isPill = this.isFancy(this.data.VALUES);
      this
        .enableClass(this.myClass('pill'), isPill)
        .addClass(this.myClass())
        .style({
          'background-color': background,
          'color': color,
          'border-color': background.includes('#FFFFFF') || ! background ? color : background
        })
        .callIf(this.showGlyph && data.glyph, () => {
          var icon = {
            size: 14,
            backgroundColor: color,
            icon: data.glyph.clone(this).getDataUrl({
              fill: background || color
            })
          };
          this.start(this.CircleIndicator, icon).addClass(this.myClass('icon')).end();
        })
        .callIfElse(isPill,
          () => { this.start().add(data.label).end(); },
          () => { this.start().addClass('p').add(data.label).end(); }
        );
    },
    {
      name: 'isFancy',
      code: foam.Function.memoize1(function(values) {
        for ( value of values ) {
          if ( value.color || value.background ) { return true; }
        }
      })
    }
  ]
});
