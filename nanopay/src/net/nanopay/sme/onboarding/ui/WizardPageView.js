foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'WizardPageView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'

  ],
  css: `
    ^ {
      background-color: white;
      height: 84%;
    }

    ^sections-container {
      height: 100%;
      align-items: center !important;
    }

    ^left-section {
      padding-top: 
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
      name: 'section'
    },
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start(this.Cols, {
          defaultChildStyle: {
            flex: 1,
            basis: 0,
            padding: '0px 128px'
          }
        }).addClass(this.myClass('sections-container'))
          .start(this.Rows, {
            defaultChildStyle: {
              'display' : 'flex',
              'justify-content' : 'center'
            }
          }).addClass(this.myClass('left-section'))
            .start({ class: 'foam.u2.tag.Image', data: 'images/ablii/joanne@2x.jpg' }).addClass(this.myClass('joanne')).end()
            .start('h1').addClass(this.myClass('help'))
              .add(this.section$.dot('help'))
            .end()
          .end()
          .tag(this.SectionView, {
            section$: this.section$,
            data$: this.data$
         })
        .end()
    }
  ]
});
