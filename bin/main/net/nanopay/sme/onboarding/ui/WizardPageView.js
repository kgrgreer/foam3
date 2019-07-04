foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'WizardPageView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
  ],
  css: `
    ^ {
      height: 92%;
      border-bottom: solid 1px #edf0f5;
    }

    ^sections-container {
      height: 100%;
      align-items: center !important;
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

    ^right-section {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      overflow: scroll;
      height: 100%;
      flex: 1;
      basis:0;
      padding-right: 128px;
    }

    ^left-section {
      flex: 1;
      flex-basis: 0;
      justify-content: center;
      display: flex;
      align-items: center;
    }

    ^left-section * {
      display: flex;
      justify-content: center;
    }

    ^ .property-signingOfficer .foam-u2-view-RadioView:last-child {
      margin: 0;
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
        .start(this.Cols)
          .addClass(this.myClass('sections-container'))
          .start(this.Rows)
            .addClass(this.myClass('left-section'))
            .start({ class: 'foam.u2.tag.Image', data: 'images/ablii/joanne@2x.jpg' })
              .addClass(this.myClass('joanne'))
            .end()
            .start('h1').addClass(this.myClass('help'))
              .add(this.section$.dot('help'))
            .end()
          .end()

          .start()
            .addClass(this.myClass('right-section'))
            .start(this.SectionView, {
              section$: this.section$,
              data$: this.data$
            }).style({ 'flex': 1 }).end()
          .end()
        .end();
    }
  ]
});
