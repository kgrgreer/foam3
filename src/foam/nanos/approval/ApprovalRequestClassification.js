/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequestClassification',

  imports: [
    'translationService'
  ],

  javaImports:[
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.translationService.getTranslation(foam.locale, this.id + ".name", this.name);
      },
      javaCode: `
        TranslationService ts = (TranslationService) getX().get("translationService");
        Subject subject = (Subject) getX().get("subject");
        String locale = (String) getX().get("foam.nanos.auth.LocaleSupport.CONTEXT_KEY");
        return ts.getTranslation(locale, getId() + ".name", getName());
      `
    }
  ]
});
