foam.CLASS({
  package: 'net.nanopay.admin.ui.shared',
  name: 'FooterView',
  extends: 'foam.u2.View',

  documentation: 'View to display footer includes copyright label',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 990px;
          margin: auto;
          position: relative;
        }
        ^ h3{
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          text-align: center;
          color: #262626;
          display: inline-block;
          opacity: 0.6;
          float: left;
          margin-left: 25px;
        }
        ^ .copyright-label{
          margin-right: 50px;
          float: right;
          opacity: 0.3;
        }
      */}
    })
  ],

  messages: [
    { name: 'portalLabel',    message: 'Connected Merchant Powered by @Connected City' },
    { name: 'copyrightLabel', message: ' Connected City 2017, all rights reserved.' },
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('h3').add(this.portalLabel).end()
          .start('h3').addClass('copyright-label').add("Copyright ").add(this.Entity.create({ name: '#169' })).add(this.copyrightLabel).end()
        .end()
    }
  ]
});
