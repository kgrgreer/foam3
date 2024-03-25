/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'DAOViewBorder',
  extends: 'foam.u2.borders.ControlBorder',
  documentation: ``,

  requires: [
    'foam.u2.borders.CardBorder',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.stack.BreadcrumbView'
  ],

  css: `
    ^ {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      padding: 32px;
      gap: 24px;
      overflow: auto;
    }
    ^browse-title {
      transition: all 0.2s ease;
    }
    ^header-container > foam-u2-layout-Cols {
      justify-content: space-between;
    }
  `,
  properties: [
    {
      class: 'Boolean',
      name: 'showNav',
      value: true
    },
    'viewTitle',
    'buttonHolder'
  ],
  methods: [
    function render() {
      this
        .addClass()
        .start()
          .addClass(this.myClass('header-container'))
          .start(this.Cols)
            .start()
              .addClass('h100', this.myClass('browse-title'))
              .add(this.viewTitle$)
            .end()
            .tag('', {}, this.buttonHolder$)
          .end()
        .end()
        .start('', {}, this.content$).style({ display: 'contents' }).end();
    }
  ]
});
