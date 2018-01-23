foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksSubHeader',
  extends: 'foam.u2.Controller',

  imports: [
    'group',
    'logo'
  ],
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: %PRIMARYCOLOR%;
          height: 65px;
          margin-bottom: 20px;
          margin-top: 20px;
        }

        ^ .icConnected {
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-left: 30px;
          vertical-align: middle;
        }

        ^ .firstImg {
          display: inline-block;
          max-width: 120px;
          max-height: 65px;
          width: auto;
          height: auto;
          vertical-align: middle;
          margin-left: 82px;
        }

        ^ .secondImg {
          display: inline-block;
          width: 120px;
          height: 65px;
          margin-left: 30px;
          vertical-align: middle;
        }
      */}
    })
  ],

  properties: [
    'secondImg'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var logoSlot = this.group.logo$.map(function(logo) { return logo || self.logo; });
      this
      .addClass(this.myClass())
      .start('div')
        .start({class: 'foam.u2.tag.Image', data$: logoSlot}).addClass('firstImg').end()
        .start({class: 'foam.u2.tag.Image', data: 'images/banks/ic-connected.svg'}).addClass('icConnected').end()
        .start({class: 'foam.u2.tag.Image', data$: this.secondImg$}).addClass('secondImg').end()
      .end()
    }
  ]
})
