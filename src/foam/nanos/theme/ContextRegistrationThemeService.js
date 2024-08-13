/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ContextRegistrationThemeService',
  extends: 'foam.nanos.theme.ProxyThemeService',
  documentation: `Decorator for theme service that loads refinements and registers classes from fetched theme into context`,

  implements: [
    'foam.nanos.theme.ThemeService'
  ],

  requires: [
    'foam.box.HTTPBox',
    'foam.nanos.theme.Themes'
  ],

  methods: [
    async function findTheme(x) {
      var theme = await this.delegate.findTheme();
      if ( theme ) {
        if ( theme.customRefinement ) await x.__subContext__.classloader.load(theme.customRefinement, []);
        if ( theme.registrations ) {
          theme.registrations.forEach(r => {
            x.__subContext__.register(this.__subContext__.lookup(r.className), r.targetName);
          });
        }
        return theme;
      }

      return this.Themes.create().findTheme(x);
    }
  ]
});
