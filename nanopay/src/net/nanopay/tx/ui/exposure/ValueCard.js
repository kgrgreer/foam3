foam.CLASS({
  package: 'net.nanopay.tx.ui.exposure',
  name: 'ValueCard',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      box-sizing: border-box;
      flex: 1;
      height: 188px;

      padding: 24px 16px;

      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;

      display: inline-block;
      margin-right: 16px;
    }

    ^:last-child {
      margin-right: 0;
    }

    ^ p {
      margin: 0;
      /* TODO: font-family: IBMPlexSans;*/
      font-weight: 600;
      line-height: 1.5;
    }

    ^title {
      font-size: 12px;
      margin-bottom: 32px !important;
    }

    ^value {
      font-size: 28px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'title',
      value: 'PLACEHOLDER TITLE'
    },
    {
      class: 'String',
      name: 'value',
      value: 'PLACEHOLDER VALUE'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.title$).end()
        .start('p').addClass(this.myClass('value')).add(this.value$).end();
    }
  ]
});
