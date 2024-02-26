/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'AppBadgeView',
  extends: 'foam.u2.View',

  documentation: `View to display various app store badges`,
  
  imports: [
    'appConfig'
  ],

  css: `
  ^{
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  ^badge-container{
    display: flex;
    gap: 2rem;
    justify-content: center;
  }
  ^appStoreBadge > img, ^playStoreBadge > img {
    width: 108px;
    height: 54px;
  }
  ^legal {
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: 0.8rem;
    margin: 0 1rem;
    text-align: center;
    font-size: 0.8rem;
    width: 100%;
  }
  ^legal-container{
    position: absolute;
    bottom: 1.2rem;
    left: 0;
  }

  @media only screen and (min-width:  /*%DISPLAYWIDTH.MD%*/ 768px) {
    ^appStoreBadge > img, ^playStoreBadge > img {
      width: 125px;
      height: 62px;
    }
  }
  `,
  properties: [
    { 
      name: 'isAndroid',
      factory: function() {
        return navigator.userAgent.indexOf('Android') > -1;
      }
    },
    { 
      name: 'isIOS',
      factory: function() {
        return navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1;
      }
    },
    {
      name:'isReferral',
      class: 'Boolean'
    },
    {
      name: 'showBadges',
      expression: function() { 
        return (this.appConfig.playLink || this.appConfig.appLink) && (! navigator.standalone) && (! this.isReferral)
      }
    },
    {
      name: 'legalTextAbsolute',
      class: 'Boolean',
      value: true
    }
  ],

  messages: [
    { name: 'GPLAY_LEGAL', message: 'Google Play and the Google Play logo are trademarks of Google LLC.'},
    { name: 'APPSTORE_LEGAL', message: 'Apple and the Apple Logo are trademarks of Apple Inc.'}
    
  ],

  methods: [
    function render() {

      this.addClass(this.myClass()).show(this.showBadges)
      .start().addClass(this.myClass('badge-container'))
        .start('a').addClass(this.myClass('appStoreBadge')).hide(this.isAndroid || !this.appConfig.appLink).attrs({ href: this.appConfig.appLink })
          .start('img')
            .attrs({ alt:'Download on the App Store', src:'/images/app-store-badge.svg'})
          .end()
        .end()
        .start('a').addClass(this.myClass('playStoreBadge')).hide(this.isIOS || !this.appConfig.playLink).attrs({ href: this.appConfig.playLink })
          .start('img')
            .attrs({ alt:'Get it on Google Play', src:'/images/play-store-badge.svg'})
          .end()
        .end()
      .end()

      .start().addClass('p-legal', this.myClass('legal')).enableClass(this.myClass('legal-container'), this.legalTextAbsolute$)
        .start().hide(this.isAndroid || !this.appConfig.appLink).add(this.APPSTORE_LEGAL).end()
        .start().hide(this.isIOS || !this.appConfig.playLink).add(this.GPLAY_LEGAL).end()
      .end();
    }
    
  ]
});
