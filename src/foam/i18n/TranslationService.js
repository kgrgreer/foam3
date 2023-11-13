/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.i18n',
  name: 'TranslationService',

  skeleton: true,

  methods: [
    {
      name: 'getTranslations',
      args: [ 'String locale' ],
      async: true,
      javaType: 'foam.i18n.Locale[]'
    },
    {
      name: 'getTranslation',
      async: true,
      args: [
        {
          name: 'locale',
          type: 'String'
        },
        {
          name: 'source',
          type: 'String'
        },
        {
          name: 'defaultText',
          type: 'String',
          documentation: 'The default text'
        }
      ],
      type: 'String'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(`
          static String t(foam.core.X x, String source, String defaultText) {
            if ( x == null ) return defaultText;

            var ts = (TranslationService) x.get("translationService");
            if ( ts == null ) return defaultText;

            var locale = (String) x.get("locale.language");
            if ( foam.util.SafetyUtil.isEmpty(locale) ) locale = "en";

            return ts.getTranslation(locale, source, defaultText);
          }
        `);
      }
    }
  ]
});
