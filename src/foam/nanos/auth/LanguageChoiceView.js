/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LanguageChoiceView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.Action',
    'foam.nanos.auth.Language',
    'foam.u2.view.OverlayActionListView',
    'foam.u2.View'
  ],

  imports: [
    'countryDAO',
    'languageDAO',
    'stack',
    'subject',
    'translationService',
    'userDAO'
  ],

  exports: [ 'as data' ],

  css: `
    ^dropdown span, ^dropdown svg {
      font-size: 1.4rem;
      font-weight: 500;
      color: /*%WHITE%*/ #ffffff;
    }
  `,

  properties: [
    'optionsBtn_',
    'supportedLanguages',
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Language',
      name: 'lastLanguage',
      factory: function() {
        let language = this.supportedLanguages.find( e => e.toString() === foam.locale )
        language = language === undefined ? this.defaultLanguage : language
        localStorage.setItem('localeLanguage', language.toString());
        return language;
      }
    }
  ],

  methods: [
    async function render() {
      var self = this;
      this.supportedLanguages = (await this.languageDAO
        .where(foam.mlang.predicate.Eq.create({
          arg1: foam.nanos.auth.Language.ENABLED,
          arg2: true
        })).select()).array;

      var actionArray = this.supportedLanguages.map( c => {
        var labelSlot = foam.core.PromiseSlot.create({ value: '', promise: self.formatLabel(c) });
        return self.Action.create({
          name: c.name,
          label$: labelSlot,
          code: async function() {
            let user = self.subject.realUser;
            user.language = c.id;
            await self.userDAO.put(user);
            location.reload();
            localStorage.setItem('localeLanguage', c.toString());
          }
        });
      });

      var label = this.formatLabel(this.lastLanguage);

      this
        .addClass(this.myClass())
        .start(this.OverlayActionListView, {
          label:       label,
          data:        actionArray,
          obj:         self,
          buttonStyle: 'UNSTYLED'
        })
          .addClass(this.myClass('dropdown'))
        .end()
      .end();
    },

    async function formatLabel(language) {
      let country = await this.countryDAO.find(language.variant);
      let label   = language.variant != '' ? `${language.nativeName}(${language.variant})` : `${language.nativeName}`;
      if ( country && country.nativeName != null ) {
        label = `${language.nativeName}\u00A0(${country.nativeName})`;
      }
      return label;
    }
  ]
});
