foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ContentCard',
  extends: 'foam.u2.View',

  documentation: 'Card that would display a singular information about an item using a title and content.',

  css: `
    ^{
      width: inherit;
      height: inherit;
      background-color: #FFFFFF;
      letter-spacing: 0.3px;
      position: relative;
    }

    ^ .coloredColumn {
      content: '';
      position: absolute;
      background-color: /*%PRIMARY3%*/ #406dea;
      width: 6px;
      height: 100px;
    }

    ^ .title {
      position: absolute;
      font-size: 12px;
      font-weight: 300;
      width: inherit;
      padding: 15px 30px;
      margin: 0;
    }

    ^ .content {
      position: absolute;
      height: inherit;
      bottom: 16px;
      width: inherit;
      padding-left: 30px;
      margin: 0;
      font-size: 30px;
    }
  `,

  properties: [
    'title',
    'content'
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div')
          .start('div').addClass('coloredColumn').end()
          .start('p').addClass('title').add(this.title$).end()
          .start('p').addClass('content').add(this.content$).end()
        .end()
    }
  ]
});
