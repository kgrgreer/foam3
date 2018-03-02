foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'FooterView',
  extends: 'foam.u2.View',

  documentation: 'View to display footer, including copyright label',

  imports: [
    'webApp',
    'aboutUrl',
    'privacyUrl',
    'termsUrl'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          min-width: 992px;
          margin: auto;
          position: relative;
          top: 60;
        }
        ^ div {
          font-size:14px;
        }
        ^ .copyright-label {
          margin-right: 50px;
          float: right;
        }
        ^ .col {
          display: inline-block;
          vertical-align: middle;
        }
        ^ .copyright-label, 
        ^ .net-nanopay-ui-ActionView-goToTerm,
        ^ .net-nanopay-ui-ActionView-goToPrivacy,
        ^ .net-nanopay-ui-ActionView-goToNanopay {
          background: transparent;
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.2px;
          color: #272727;
          width: auto !important;
          padding: 0 10px !important;
        }
        ^ .net-nanopay-ui-ActionView-goToTerm:hover,
        ^ .net-nanopay-ui-ActionView-goToPrivacy:hover,
        ^ .net-nanopay-ui-ActionView-goToNanopay:hover {
          text-decoration: underline;
        }
        ^ .net-nanopay-ui-ActionView-goToNanopay {
          padding-left: 50px;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'aboutLabel',
      factory: function () {
        return 'Powered by ' + this.aboutUrl.replace(/(^\w+:|^)\/\//, '');
      }
    }
  ],

  methods: [
    function initE(){
      this.SUPER();

      console.log(this.aboutLabel);

      this
        .addClass(this.myClass())
        .start('div').addClass('col')
          .start(this.GO_TO_NANOPAY, { label: this.aboutLabel })
            .style({
              'margin-left': '50px'
            })
          .end()
          .add('|')
          .start(this.GO_TO_TERM).end()
          .add('|')
          .start(this.GO_TO_PRIVACY).end()
        .end()
        .start('div').addClass('col').addClass('copyright-label')
          .start('p').add('Copyright © 2018 ' + this.webApp + '. All rights reserved.').end()
        .end()
        
    }
  ],

  actions: [
     {
      name: 'goToNanopay',
      code: function(X) {
        this.window.location.assign(X.aboutUrl);
      }
    },
    {
      name: 'goToTerm',
      label: 'Terms and Conditions',
      code: function(X) {
        this.window.location.assign(X.termsUrl);
      }
    },
    {
      name: 'goToPrivacy',
      label: 'Privacy Policy',
      code: function(X) {
        this.window.location.assign(X.privacyUrl);
      }
    }
  ]
});
