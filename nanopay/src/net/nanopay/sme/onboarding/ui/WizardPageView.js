foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'WizardPageView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'

  ],
  imports: [
    'data as fobj'
  ],
  css: `
    ^ {
      background-color: white;
    }

    ^joanne {
      width: 128px;
      height: 128px;
      border-radius: 64px;
    }

    ^help {
      width: 331px;
      margin-top: 36px;

      font-family: Lato;
      font-size: 24px;
      font-weight: normal;
      line-height: 1.5;
      text-align: center;
      color: #525455;
    }
  `,
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
      name: 'data'
    },
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start(this.Cols, {
          defaultChildStyle: {
            flex: 1,
            basis: 0
          }
        })
          .start(this.Rows, {
            defaultChildStyle: {
              'display' : 'flex',
              'justify-content' : 'center'
            }
          }).style({ 'justify-content': 'center'})
            .start({ class: 'foam.u2.tag.Image', data: 'images/ablii/joanne@2x.jpg' }).addClass(this.myClass('joanne')).end()
            .start('h1').addClass(this.myClass('help'))
              .add(this.data$.dot('help'))
            .end()
          .end()
          .tag(this.SectionView, { data: this.data })
        .end()
    }
  ]
});
