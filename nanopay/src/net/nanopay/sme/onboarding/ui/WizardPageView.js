foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'WizardPageView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Cols'
  ],
  imports: [
    'data as fobj'
  ],
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
      this
        .start(this.Cols, {
          defaultChildStyle: {
            flex: 1,
            basis: 0
          }
        })
          .start('h1')
            .add(this.data$.dot('help'))
          .end()
          .tag(this.SectionView, { data: this.data })
        .end();
    }
  ]
});
