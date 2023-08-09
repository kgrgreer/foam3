/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'NullTranslationService',

  implements: [
    'foam.i18n.TranslationService'
  ],

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    {
      name: 'getTranslation',
      code: function(locale, source, defaultText) {
        return defaultText;
      }
    }
  ]
});
