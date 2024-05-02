/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'DAOController',
  extends: 'foam.u2.View',

  mixins: ['foam.u2.Router'],

  documentation: `
    // TODO
  `,

  css: `
    ^content, ^content > *  { height: 100%; }
  `,
  imports: [
    'auth',
    'currentMenu?',
    'stack',
    'pushMenu'
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
      this.stack.setTitle(this.viewTitle$, this);
      var self = this;
      this.SUPER();
      this.dynamic(function(route) {
        self.removeAllChildren(); // TODO: not needed in U3
        self.addClass(self.myClass('content'));
        if ( route == 'create' ) {
          if ( this.config.createMenu ) {
            self.pushMenu(self.config.createMenu);
            this.route = '';
          }
          if ( this.config.createController ) {
            this.stack.push({
                data: (this.config.factory || this.data.of).create({ mode: 'create'}, this),
                config$: this.config$,
                title: 'Create ' + this.data.of.id,
                of: this.data.of,
                ...this.config.createController
            }, this);
          }
        } else if ( route ) {
          self.tag({
            class: 'foam.comics.v3.DetailView',
            config$: self.config$,
            idOfRecord$: self.route$
          });
        } else {
          self.renderDAOView();
        }
      });
    },
    function renderDAOView() {
      var self = this;
      this.stack.setTitle(this.viewTitle$, self);
      self.tag({
        class: 'foam.comics.v3.DAOView',
        data$: self.data$,
        config$: self.config$
      });
    }
  ]
});

