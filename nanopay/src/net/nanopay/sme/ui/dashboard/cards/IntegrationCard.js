foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'IntegrationCard',
  extends: 'foam.u2.Element',

  imports: [
    'data'
  ],

  css: `
    ^ {
      width: 504px;
      height: 72px;

      box-sizing: border-box;

      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #edf0f5;
      background-color: #ffffff;

      padding: 16px 24px;
    }

    ^flex-container {
      display: flex;
    }

    ^icon {
      display: inline-block;
      vertical-align: middle;

      width: 40px;
      height: 40px;

      margin-right: 16px;
    }

    ^title-box {
      display: inline-block;
      vertical-align: middle;
    }

    ^title {
      margin: 0;

      font-size: 14px;
      font-weight: 900;
      line-height: 1.5
      color: #2b2b2b;
    }

    ^subtitle {
      margin: 0;

      font-size: 14px;
      line-height: 1.5;
      color: #8e9090;
    }

    ^action {
      vertical-align: middle;

      width: 96px !important;
      margin-left: auto;

      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      border: solid 1px #604aff;
      background-color: #ffffff !important;
      color: #604aff !important;
    }

    ^action:hover {
      background-color: #604aff !important;
      color: #ffffff !important;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'iconPath'
    },
    {
      class: 'String',
      name: 'title',
      value: 'Title'
    },
    {
      class: 'String',
      name: 'subtitle',
      value: 'Subtitle'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'action'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .add(this.slot(function(iconPath, title, subtitle, action) {
          return this.E().addClass(self.myClass('flex-container'))
            .start({ class: 'foam.u2.tag.Image', data: self.iconPath }).addClass(self.myClass('icon')).end()
            .start().addClass(self.myClass('title-box'))
              .start('p').addClass(self.myClass('title')).add(self.title).end()
              .start('p').addClass(self.myClass('subtitle')).add(self.subtitle).end()
            .end()
            .startContext({ data: self.data })
              .start(self.action).addClass(self.myClass('action')).end()
            .endContext();
        }));
    }
  ]
});
