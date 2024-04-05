/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'DAOController',
  extends: 'foam.u2.View',

  implements: ['foam.u2.Routable'],

  documentation: `
    // TODO
  `,

  css: `
    ^content > *  { height: 100%; }
  `,
  imports: [
    'auth',
    'currentMenu?',
    'stack'
  ],

  exports: [
    'as daoController',
    'config',
    'click'
  ],
  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder',
    'foam.u2.stack.StackBlock',
    'foam.u2.stack.Stack',
    'foam.u2.stack.DesktopStackView'
  ],

  properties: [
    {
      class: 'String',
      name: 'route',
      memorable: true
    },
    {
      name: 'translationService',
      factory: function() { return this.__context__.translationService || foam.i18n.NullTranslationService.create(); }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return foam.comics.v2.DAOControllerConfig.create({dao: this.data});
      }
    },
    {
      name: 'click',
      expression: function(config$click) {
        if ( this.config.disableSelection ) {
          return () => {};
        }
        if ( this.config.click && typeof this.config.click === 'function' )
          return this.config.click;
        // This function is exported and is not always called with the 'this' being the current view
        // which is why we need to fetch config from subContext
        return function(obj, id) {
          this.__subContext__.daoController.route = id || obj.id;
        };
      }
    },
    {
      name: 'viewTitle',
      expression: function(config) {
        var menuID = this.currentMenu ? this.currentMenu.id : config.of.id;
        return this.translationService.getTranslation(foam.locale, menuID + '.browseTitle', config.browseTitle);
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.addCrumb();
    },
    function render() {
      this.stack.setTitle(this.viewTitle$);
      var self = this;
      this.SUPER();
      this.dynamic(function(route) {
        self.removeAllChildren(); // TODO: not needed in U3
        self.addClass(self.myClass('content'));
        if ( route ) {
          self.tag({
            class: 'foam.comics.v3.DetailView',
            config$: self.config$,
            idOfRecord$: self.route$
          });
        } else {
          this.stack.setTitle(this.viewTitle$);
          self.tag({
            class: 'foam.comics.v3.DAOBrowseView',
            data$: self.data$,
            config$: self.config$
          });
        }
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'DAOBrowseView',
  extends: 'foam.u2.View',

  imports: [
    'config as importedConfig',
    'stack'
  ],

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder'
  ],

  cssTokens: [
    {
      name: 'borderSize',
      value: '1px solid $grey300'
    },
    {
      name: 'boxShadowSize',
      value: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)'
    }
  ],

  css: `
    ^ .foam-u2-borders-CardBorder {
      border: $borderSize;
      border-radius: 4px;
      box-sizing: border-box;
      box-shadow: $boxShadowSize;
      height: 100%;
      padding: 0;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.importedConfig ?? this.onDetach(foam.comics.v2.DAOControllerConfig.create({dao: this.data}));
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'browseView',
      expression: function(config$browseViews) {
        return config$browseViews && config$browseViews.length
          ? config$browseViews[0].view
          : this.DAOBrowserView
          ;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;
      this    
        .addClass()  
        .start(self.CardBorder)
        .style({ position: 'relative', 'min-height': this.config.minHeight + 'px' })
        .start(this.config.browseBorder)
          .call(function() {
            this.add(self.slot(function(browseView) {
              return self.E().tag(browseView, { data: this.data, config: this.config } );
            }));
          })
        .end();
    }
  ]
});