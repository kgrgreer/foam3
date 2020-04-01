foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'ErrorPageView',
  extends: 'foam.u2.Element',

  documentation: 'General Error Page View',

  css: `
    ^ {
      background-color: white;
      width: 100%;
      height: 100%;
    }
    ^ .top-bar {
      width: 100%;
      height: 64px;
      border-bottom: solid 1px #e2e2e3;
      text-align: center;
      background-color: white;
    }

    ^ .top-bar img {
      height: 25px;
      margin-top: 20px;
    }

    ^ .Message-Container {
      width: 330px;
      height: 215px;
      border-radius: 2px;
      padding-top: 5px;
      margin: auto;
      background-color: white;
    }

    ^ .Instructions-Text {
      width: 100%;
      height: 48px;
      font-family: Lato;
      font-size: 32px;
      font-weight: 900;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.5;
      letter-spacing: normal;
      text-align: center;
      color: var(--black);
      margin-top: 100px;
      margin-bottom: 60px;
    }

    ^ .Message-Content {
      height: 63px;
      font-family: Lato;
      font-size: 16px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.31;
      letter-spacing: normal;
      color: var(--black);
    }
  `,


  properties: [
    'title',
    'info_1',
    'info_2'
  ],

  methods: [
    function init() {

      this
        .addClass(this.myClass())
        .start()
        .start()
          .addClass('top-bar')
          .start('img')
              .attr('src', 'images/ablii-wordmark.svg')
          .end()
        .end()
        .start().addClass('Message-Container')
          .start().addClass('Instructions-Text').add(this.title$).end()
           .br()
           .start().addClass('Message-Content').style({ 'margin-left': '-100', 'width': '590px'})
             .add(this.info_1$)
           .end()
           .start().addClass('Message-Content').style({ 'margin-left': '-140', 'width': '640px'})
              .add(this.info_2$)
           .end()
         .end()
       .end();
    }
  ]
});
