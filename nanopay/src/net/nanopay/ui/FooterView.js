foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'FooterView',
  extends: 'foam.u2.View',

  documentation: 'View to display footer, including copyright label',
  
  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
  ],

  imports: [
    'webApp',
    'privacyUrl',
    'termsUrl',
    'user'
  ],

  exports: [
    'openTermsModal'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          min-width: 992px;
          margin: auto;
          position: relative;
          overflow: hidden;
          zoom: 1;
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
        ^ .copyright-label{
          flaot: right;
        }
        ^ .mini-links {
          float: left;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'aboutLabel',
      factory: function () {
        return 'Powered by nanopay';
      }
    },
    {
      class: 'String',
      name: 'version'
    }
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('col').addClass('mini-links')
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

    },
    function openTermsModal() {
      this.version = " "
      this.add(this.Popup.create().tag({ class: 'net.nanopay.ui.modal.TandCModal', exportData$: this.version$ }));
    }
  ],

  actions: [
     {
      name: 'goToNanopay',
      code: function(X) {
        this.window.location.assign('https://nanopay.net');
      }
    },
    {
      name: 'goToTerm',
      label: 'Terms and Conditions',
      code: function(X) {
        X.openTermsModal()
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
