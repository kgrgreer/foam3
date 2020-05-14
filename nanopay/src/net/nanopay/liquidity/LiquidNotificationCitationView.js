foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquidNotificationCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'truncated',
      documentation: 'determines whether the body content is truncated or not.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .enableClass('fully-visible', this.truncated$)
          .on('click', this.toggleTruncation)
          .add(this.data.initiationDescription)
          .add(this.data.entity)
          .add(this.data.description)
          .add(this.data.approvalStatus)
        .end();
    }
  ],

  listeners: [
    function toggleTruncation() {
      this.truncated = ! this.truncated;
    }
  ]
});
