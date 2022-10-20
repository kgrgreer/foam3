/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.theme.customisation',
  name: 'CSSTokenOverrideService',

  mixins: ['foam.util.DeFeedback'],

  imports: [
    'cssTokenOverrideDAO? as tokenOverrideDAO',
    'theme?'
  ],

  implements: ['foam.mlang.Expressions'],

  requires: [
    'foam.nanos.theme.customisation.CSSTokenOverride',
    'foam.core.Latch'
  ],

  topics: [ 'cacheUpdated' ],

  properties: [
    {
      class: 'Map',
      name: 'tokenCache',
      documentation: "A map of theme id's to maps of source id's to targets."
    },
    {
      name: 'initLatch',
      documentation: 'Latch to denote cache has been loaded and service is ready',
      factory: function() { return this.Latch.create(); }
    },
    {
      name: 'cached_',
      class: 'Boolean'
    }
  ],

  methods: [
    function init() {
      // TODO: Add responsive theme based token caching, TBD when
      this.loadTokenCache().then(() => {
        this.onDetach(this.tokenOverrideDAO.on.sub(this.maybeReload));
      });
    },

    function loadTokenCache() {
      this.initLatch.then(() => {
        this.cached_ = true;
        this.cacheUpdated.pub();
      })
      return this.tokenOverrideDAO.where(this.EQ(this.CSSTokenOverride.ENABLED, true)).select(token => {
        var themeMap = this.themeMap(token.theme)[token.source] = token.target;
      }).then(() => this.initLatch.resolve());
    },

    function themeMap(theme) {
      return this.tokenCache[theme] || ( this.tokenCache[theme] = {} );
    }
  ],

  listeners: [
    function maybeReload() {
      this.initLatch = this.Latch.create();
      this.clearProperty('tokenCache');
      this.clearProperty('cached_');
      this.loadTokenCache();
      return this.initLatch;
    },

    function getTokenValue(tokenString, cls, ctx) {
      if ( ! tokenString.startsWith('$') ) return tokenString;
      var self = this;
      if ( this.cached_ ) {
        let themeID = ctx?.theme?.id || this.theme?.id || '';
        let result  = null;
        var [ tokenName, cls, fullString ] = foam.CSS.returnTokenAndClass(tokenString, cls);
        var args = [
          /**
           * Wildcarding:
           * ThemeID = current theme
           * tokenName = tokenString with $ removed, eg. "token1"
           * fullString = cls.id + tokenName eg. "foam.somePackage.someClass.token1"
           */
          [themeID, fullString],
          [themeID, tokenName],
          ['', fullString],
          ['', tokenName]
        ];

        for ( var i = 0 ; i < args.length && ! result ; i ++) {
          result = this.tokenValueHelper.apply(self, args[i]);
          if ( result ) {
            if ( result.startsWith?.('$') )
              return this.getTokenValue.call(this, result, cls, ctx);
            return result;
          }
        }
      }

      //TODO: Put to default theme in override dao
      return foam.CSS.getTokenValue.call(this, tokenString, cls, ctx);
    },

    function tokenValueHelper(theme, name) {
      var themeMap = this.tokenCache[theme];
      if ( ! themeMap ) return;
      return themeMap[name];
    }
  ]
});
