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

  javaImports: [
    'static foam.i18n.TranslationService.t'
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
        return t(getX(), getId() + ".name", getName());
      `
    }
  ]
});
