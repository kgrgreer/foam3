/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'SupportMenu',
  extends: 'foam.nanos.menu.PseudoMenu',

  imports: [
    'theme'
  ],
  requires: [
    'foam.nanos.menu.Menu'
  ],
  messages: [
    { name: 'CONTACT_SUPPORT', message: 'Contact Support' },
    { name: 'EMAIL_LABEL', message: 'Email' },
    { name: 'PHONE_LABEL', message: 'Phone' }
  ],
  properties: [
    {
      name: 'children_',
      factory: function() {
        var aDAO = this.ArrayDAO.create();
        if ( this.theme && this.theme.supportConfig.supportEmail ) {
          aDAO.put(this.Menu.create({
            id: this.id + '/email',
            label: `${this.EMAIL_LABEL}: ${this.theme.supportConfig.supportEmail}`,
            parent: this.id,
            openNewTab: true,
            handler: {
              class: 'foam.nanos.menu.LinkMenu',
              link$: this.slot(function(theme$supportConfig) {
                return 'mailto:' + this.theme.supportConfig.supportEmail;
              })
            }
          }, this));
        }
        if ( this.theme && this.theme.supportConfig.supportPhone ) {
          aDAO.put(this.Menu.create({
            id: this.id + '/phone',
            label: `${this.PHONE_LABEL}: ${this.theme.supportConfig.supportPhone}`,
            parent: this.id,
            handler: {
              class: 'foam.nanos.menu.LinkMenu',
              link$: this.slot(function(theme$supportConfig) {
                return 'tel:' + this.theme.supportConfig.supportPhone;
              })
            }
          }, this));
        }
        return aDAO;
      }
    }
  ]
});
