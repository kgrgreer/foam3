/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.theme.customisation',
  name: 'TokenOverrideService',

  imports: ['tokenOverrideDAO?', 'theme?'],

  implements: ['foam.mlang.Expressions'],

  requires: ['foam.nanos.theme.customisation.CSSTokenOverride'],

  listeners: [
    async function getTokenValue(tokenString, cls, ctx) {
      var self = this;
      let themeID = ctx?.theme?.id || this.theme?.id || '';
      let result = null;
      var [ tokenName, cls, fullString ] = foam.CSS.returnTokenAndClass(tokenString, cls);
      if ( this.tokenOverrideDAO ) {
        var args = [
          //[theme, name]
          [themeID, fullString],
          [themeID, tokenName],
          ['',fullString],
          ['',tokenName]
        ];
        for ( var i = 0; i < args.length && ! result; i ++) {
          result = await this.tokenValueHelper.apply(self, args[i]);
        }
      }
      if ( result ) 
        return result.target || `/* invalid token target ${tokenString}, ${cls}*/`;
      //TODO: Put to default theme in override dao
      return foam.CSS.getTokenValue.call(this, tokenName, cls, ctx, true);
    },
    async function tokenValueHelper(theme, name) {
      var pred = this.AND(
        this.EQ(this.CSSTokenOverride.ENABLED, true),
        this.EQ(this.CSSTokenOverride.THEME, theme),
        this.EQ(this.CSSTokenOverride.SOURCE, name)
      );
      // TODO: why does this not work?
      // let r = await this.tokenOverrideDAO.find(pred);
      let r = await this.tokenOverrideDAO.select();
      r = r?.array.filter(obj => pred.f(obj))
      return r.length ? r[0] : undefined;
    }
  ]
});
