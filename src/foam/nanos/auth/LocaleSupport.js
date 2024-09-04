/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LocaleSupport',

  documentation: 'Support methods for Locales',

  javaImports: [
    'foam.nanos.auth.LanguageId',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'javax.servlet.http.HttpServletRequest'
  ],

  axioms: [
    foam.pattern.Singleton.create(),
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public final static String CONTEXT_KEY = "locale.language";

  private final static LocaleSupport instance__ = new LocaleSupport();
  public static LocaleSupport instance() { return instance__; }
          `
        }));
      }
    }
  ],

  methods: [
    {
      documentation: 'Attempt to determine a language locale',
      name: 'findLanguageLocale',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaCode: `
      // User
      Subject subject = (Subject) x.get("subject");
      if ( subject != null ) {
        User user = subject.getRealUser();
        if ( user != null &&
             User.LANGUAGE.isSet(user) ) {
          Language language = (Language) user.findLanguage(x);
          if ( language != null ) {
            return language.getCode();
          }
        }
      }

      Theme theme = (Theme) x.get("theme");
      if ( theme == null ) {
        theme = ((Themes) x.get("themes")).findTheme(x);
      }
      if ( theme != null &&
           Theme.DEFAULT_LOCALE_LANGUAGE.isSet(theme) ) {
        return theme.getDefaultLocaleLanguage();
      }

      // HttpRequest Header
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        String acceptLanguage = req.getHeader("Accept-Language");
        if ( ! SafetyUtil.isEmpty(acceptLanguage) ) {
          String[] languages = acceptLanguage.split(",");
          return languages[0];
        }
      }

      return "en";
      `
    }
  ]
});
