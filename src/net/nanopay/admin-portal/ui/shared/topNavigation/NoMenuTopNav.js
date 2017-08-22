foam.CLASS({
  package: 'net.nanopay.admin.ui.shared.topNavigation',
  name: 'NoMenuTopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar with no menu',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: #14375d;
          width: 100%;
          height: 60px;
          color: white;
          padding-top: 5px;
        }
        ^ .topNavContainer {
          width: 100%;
          margin: auto;
        }
        ^ h1{
          text-align: center;
          font-weight: 100;
          font-size: 20px;
        }

        ^ .logo {
          vertical-align:middle;
        }

      */}
    })
  ],

  

  methods: [
    function initE(){
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('topNavContainer')
          .start('h1')
            .start({ class: 'foam.u2.tag.Image', data: 'images/ConnectedCityLogo.svg' }).addClass("logo").end()
            .start('span').add('Admin Portal').style({'padding-left': '14px;'}).end()
          .end()
        .end()
    }
  ]
});