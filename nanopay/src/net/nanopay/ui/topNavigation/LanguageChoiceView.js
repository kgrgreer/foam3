/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.ui.topNavigation',
  name: 'LanguageChoiceView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.PopupView',
    'foam.nanos.auth.Language',
  ],

    imports: [
    'stack'
  ],

  exports: [ 'as data' ],

  css: `
  ^carrot {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid white;
    display: inline-block;
    float: right;
    margin-top: 7px;
    margin-left: 7px;
  }
  ^ .foam-u2-ActionView-languageChoice {
    display: inline-block;
    background: none !important;
    border: 0 !important;
    box-shadow: none !important;
    width: max-content;
    cursor: pointer;
    margin-right: 27px;
  }
  ^ .foam-nanos-u2-navigation-TopNavigation-LanguageChoiceView {
    align-items: center;
  }
  ^ .foam-u2-ActionView-languageChoice > span {
    font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #ffffff;
  }
  ^ .popUpDropDown > div {
    width: 100%;
    text-align: center;
    height: 25;
    padding-bottom: 5;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: /*%BLACK%*/ #1e1f21;
    line-height: 30px;
  }
  ^ .foam-u2-PopupView {
    left: -30 !important;
    top: 51px !important;
    padding: 0 !important;
    z-index: 1000;
    width: 110px !important;
    background: white;
    opacity: 1;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
  }
  ^ .popUpDropDown > div:hover{
    background-color: #1cc2b7;
    color: white;
    cursor: pointer;
  }
  ^ .popUpDropDown::before {
    content: ' ';
    position: absolute;
    height: 0;
    width: 0;
    border: 8px solid transparent;
    border-bottom-color: white;
    -ms-transform: translate(110px, -16px);
    transform: translate(50px, -16px);
  }
  ^ .popUpDropDown > div {
    display: flex;
  }
  ^ .flag {
    width: 30px !important;
    height: 17.6px;
    object-fit: contain;
    padding-top: 6px;
    padding-left: 10px;
    margin-right: 23px;
  }
  ^ img {
    height: 17.6px !important;
    margin-right: 6;
    width: auto;
  }
  `,

  properties: [
    'optionsBtn_',
    {
      name: 'supportedLanguage',
      factory: function() {
        return [
                foam.nanos.auth.Language.create({
                  name:'fr-CA',
                  flagImage:'images/flags/canada.svg'
                }),
                foam.nanos.auth.Language.create({
                  name:'en-US',
                  flagImage:'images/flags/unitedStates.svg'
                }),
                foam.nanos.auth.Language.create({
                  name:'pt-br',
                  flagImage:'images/flags/brazil.svg'
                })
               ]
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Language',
      name: 'lastLanguage',
      factory: function() {
        let l = this.supportedLanguage.find( e => e.name == foam.locale )
        if ( l !== undefined )
          return l;
        if ( foam.locale == null ) foam.locale = 'en';
        l = this.supportedLanguage.find( e => e.name == foam.locale.substring(0, foam.locale.indexOf('-')))
        return l !== undefined ? l : this.supportedLanguage.find( e => e.name == 'en' );
      }
    }
  ],

  methods: [
    function initE() {
      var self = this
      this
        .addClass(this.myClass())
        .tag('span', null, this.optionsBtn_$)
        .start(this.LANGUAGE_CHOICE, {
          icon$: this.lastLanguage$.dot('flagImage').map(function(v) { return v || ' ';}),
          label$: this.lastLanguage$.dot('name').map(function(v) { return self.formatLabel(v) })
        })
        .start('div')
          .addClass(this.myClass('carrot'))
        .end()
      .end();
    },
    function formatLabel(name) {
      if ( ! name.includes("-") ) return name;

      var temp = name.split("-").reverse();
      temp[0] = temp[0].toUpperCase();
      return temp.join("-");
    }
  ],

  actions: [
    {
      name: 'languageChoice',
      label: '',
      code: function() {
        var self = this;
        self.optionPopup_ = this.PopupView.create({
          width: 1165,
          x: -1137,
          y: 140
        }).on('click', function() {
          return self.optionPopup_.remove();
        });

        self.optionPopup_ = self.optionPopup_.start('div').addClass('popUpDropDown')
          .add(
            this.supportedLanguage.map( c => {
              return self.E()
                .start('div')
                  .start('img')
                    .attrs({ src: c.flagImage })
                    .addClass('flag')
                  .end()
                  .add(self.formatLabel(c.name))
                  .on('click', function() {
                    self.lastLanguage = c;
                    foam.locale = c.name;
                    location.reload();

                    // TODO: Figure out a better way to store user preferences
                    localStorage.setItem('localeLanguage', c.name);
                  });
            }))
          .end();
        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
