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

  requires: [
    'foam.box.HTTPBox',
    'foam.nanos.theme.Themes'
  ],

  imports: [ 'theme?', 'client?' ],

  methods: [
    function init() {
      // If there is a theme in the client register it
      if ( this.theme && this.client ) {
        this.registerTheme(this.client, this.theme);
      }
    },
    async function findTheme(x) {
      var theme = await this.delegate.findTheme();
      if ( theme ) {
        await this.registerTheme(x, theme);
        return theme;
      }

      return this.Themes.create().findTheme(x);
    },
    async function registerTheme(x, theme) {
      // Is this still used ??
      if ( theme.customRefinement ) await x.__subContext__.classloader.load(theme.customRefinement, []);
      if ( theme.registrations ) {
        theme.registrations.forEach(r => {
          x.__subContext__.register(this.__subContext__.lookup(r.className), r.targetName);
        });
      }
    }
  ]
});
 