/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'LegalMenu',
  extends: 'foam.nanos.menu.PseudoMenu',

  imports: [
    'appConfig',
    'window'
  ],
  requires: [
    'foam.nanos.menu.Menu'
  ],
  messages: [
    { name: 'TERMS_AND_CONDITIONS_TITLE', message: 'Terms and Conditions' },
    { name: 'PRIVACY_TITLE', message: 'Privacy Policy' }
  ],
  properties: [
    {
      name: 'children_',
      factory: function() {
        var aDAO = this.ArrayDAO.create();
        if ( this.appConfig.termsAndCondLink ) {
          aDAO.put(this.Menu.create({
            id: this.id + '/T&C',
            parent: this.id,
            label: this.TERMS_AND_CONDITIONS_TITLE,
            handler: {
              class: 'foam.nanos.menu.LinkMenu',
              link$: this.slot(function(appConfig$termsAndCondLink) {
                if ( appConfig$termsAndCondLink.includes("https") )
                  return appConfig$termsAndCondLink;
                return this.window.location.origin + appConfig$termsAndCondLink;
              }),
              openNewTab: true
            }
          }));
        }
        if ( this.appConfig.privacyUrl ) {
          aDAO.put(this.Menu.create({
            id: this.id + '/privacy',
            parent: this.id,
            label: this.PRIVACY_TITLE,
            handler: {
              class: 'foam.nanos.menu.LinkMenu',
              link$: this.slot(function(appConfig$privacyUrl) {
                if ( appConfig$privacyUrl.includes("https") )
                  return appConfig$privacyUrl;
                return this.window.location.origin + appConfig$privacyUrl;
              }),
              openNewTab: true
            }
          }));
        }
        return aDAO;
      }
    }
  ]
});

