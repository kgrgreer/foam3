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
    'foam.u2.View',
    'foam.nanos.auth.Language',
    'foam.u2.view.OverlayActionListView',
    'foam.core.Action'
  ],

  imports: [
    'stack',
    'languageDAO',
    'subject',
    'userDAO',
    'countryDAO',
    'translationService'
  ],

  exports: [ 'as data' ],

  css: `
    ^container {
      height: 100%;
      display: flex;
      align-items: center;
    }
    ^container:hover {
      cursor: pointer;
    }
    ^container span {
      font-size: 12px;
    }
    ^ .foam-nanos-u2-navigation-TopNavigation-LanguageChoiceView {
      align-items: center;
    }
    ^dropdown span, ^dropdown svg {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 15px;
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
        return language
      }
    }
  ],

  methods: [
    async function initE() {
      var self = this;
      this.supportedLanguages = (await this.languageDAO
        .where(foam.mlang.predicate.Eq.create({
          arg1: foam.nanos.auth.Language.ENABLED,
          arg2: true
        })).select()).array.map( c => {
          var labelSlot = foam.core.PromiseSlot.create({ value: '', promise: self.formatLabel(c) });
          return self.Action.create({
            name: c.name,
            label$: labelSlot,
            code: async function() {
              let user = self.subject.realUser;
              user.language = c.id;
              await self.userDAO.put(user);
              location.reload();
              // TODO: Figure out a better way to store user preferences
              localStorage.setItem('localeLanguage', c.toString());
            }
          });
        });

        var label = this.formatLabel(this.lastLanguage);

      this
        .addClass(this.myClass())
        .start(this.OverlayActionListView, {
          label: label,
          data: this.supportedLanguages,
          obj: self,
          buttonStyle: 'UNSTYLED'
        })
          .addClass(this.myClass('dropdown'))
        .end()
      .end();
    },

    async function formatLabel(language) {
      let country = await this.countryDAO.find(language.variant);
      let label = language.variant != '' ? `${language.nativeName}(${language.variant})` : `${language.nativeName}`;
      if ( country && country.nativeName != null ) {
        label = `${language.nativeName}\u00A0(${country.nativeName})`;
      }
      return label;
    }
  ],

});
