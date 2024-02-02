/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'AppDownloadBadgeService',
  extends: 'foam.u2.Element',

  documentation: `
    Client side service that shows the download badges for the playstore and the app store.
    Currently only shows the playstore badge on all devices but should be made to be dynamic based 
    on current device. Will also be responsible for native app download prompts when available.
    `,

  requires: ['foam.u2.dialog.StyledModal'],
  imports: [
    'appConfig',
    'document',
    'loginSuccess',
    'initLayout',
    'theme'
  ],
  messages: [
    { name: 'APP_DOWNLOAD_TITLE', message: 'Fast and Free Money Transfers, directly from your phone'},
    { name: 'APP_DOWNLOAD_SUB', message: 'Try our mobile app for a seamless transfer experience'},
    { name: 'GPLAY_LEGAL', message: 'Google Play and the Google Play logo are trademarks of Google LLC.'}
  ],
  css: `
    ^appDownloadPopup {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
      align-items: center;
      text-align: center;
    }
    ^playLink img {
      max-width: max(18rem, 10vw);
    }
    ^legal {
      margin: 0 1rem;
      text-align: center;
      font-size: 0.8rem;
      width: 100%;
    }
    ^header{
      color: $primary400;
      text-align: center;
    }
  `,
  properties: [
    {
      class: 'Boolean',
      name: 'referralToken',
      factory: function() {
        var searchParams = new URLSearchParams(location.search);
        return searchParams.get('referral');
      },
      hidden: true
    },
    {
      name: 'popup'
    }
  ],
  methods: [
    function init() {
      if ( localStorage.getItem('showDownloadPrompt') == 'NO' ) return;
      this.loginSuccess$.sub(() => {
        this.initLayout.then(() => {
          if ( ! this.loginSuccess ) return;
          // Needed since ctrl sometimes rebuilds this
          // Prevents duplicate popups, check again after ZAC
          let existing = this.document.querySelector(`.${this.myClass('appDownloadPopup')}`);
          if ( this.referralToken && this.appConfig.playLink && ! existing ) {
            this.popup = this.StyledModal.create();
            this.popup.start().addClass(this.myClass('appDownloadPopup'))
            .start('img')
              .attr('src', this.theme.logo)
              .addClass(this.myClass('logo'))
            .end()
  
            .start().addClass(this.myClass('header'),'h400')
              .add(this.APP_DOWNLOAD_TITLE)
            .end()
            .add(this.APP_DOWNLOAD_SUB)
            .start('a').addClass(this.myClass('playLink')).attrs({ href: this.appConfig.playLink })
            .start('img')
              .attrs({ alt:'Get it on Google Play', src:'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'})
            .end().end()
            .startContext({ data: this })
            .tag(this.DONT_SHOW_AGAIN, { size: 'SMALL' })
            .endContext()
            .start()
              .addClass('p-legal', this.myClass('legal'))
              .add(this.GPLAY_LEGAL)
            .end();
            this.popup.write();

            // Remove the referral token from the URL
            window.history.replaceState('', '', window.location.origin + '/' + window.location.hash);
          }})
        }
      );
    }
  ],
  actions: [
    {
      name: 'dontShowAgain',
      buttonStyle: 'TERTIARY',
      label: `Don't show this again`,
      code: function() {
        localStorage.setItem('showDownloadPrompt', 'NO');
        this.popup.close();
      }
    }
  ]
});