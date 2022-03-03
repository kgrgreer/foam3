/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.theme.customisation',
  name: 'ThemeFacade',

  sections: [
    {
      name: 'topNavBarLogo'
    },
    {
      name: 'loginPageImage'
    },
    {
      name: 'externalImage'
    }
  ],

  properties: [
    foam.nanos.theme.Theme.NAME.clone().copyFrom({
      visibility: 'HIDDEN'
    }),
    foam.nanos.theme.Theme.TOP_NAV_LOGO.clone().copyFrom({
      view: { class: 'foam.nanos.theme.customisation.FileThemeComponentView' },
      section: 'topNavBarLogo'
    }),
    foam.nanos.theme.Theme.LOGIN_IMAGE.clone().copyFrom({
      view: { class: 'foam.nanos.theme.customisation.FileThemeComponentView' },
      section: 'loginPageImage'
    }),
    foam.nanos.theme.Theme.EXTERNAL_COMMUNICATION_IMAGE.clone().copyFrom({
      view: {
        class: 'foam.nanos.theme.customisation.FileThemeComponentView',
        supportedFormats: { 'image/png': 'PNG' }
      },
      section: 'externalImage'
    })
  ]
});
