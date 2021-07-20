/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOBrowseControllerView',
  extends: 'foam.u2.View',

  documentation: `
    The inline DAO controller for a collection of instances of a model that can
    switch between multiple views
  `,

  imports: [
    'auth',
    'currentMenu?',
    'memento',
    'stack',
    'translationService'
  ],

  exports: [
    'config',
    'memento',
  ],

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.stack.BreadcrumbView',
    'foam.u2.stack.StackBlock',
    'foam.u2.view.IconChoiceView',
    'foam.u2.view.OverlayActionListView'
  ],

  css: `
    ^container {
      padding: 24px 32px 16px 32px;
      height: 100%;
      box-sizing: border-box;
    }

    ^header-container {
      padding-bottom: 32px;
      align-items: center;
    }

    ^altview-container {
      position: absolute;
      right: 0;
      padding: 12px 16px 0 0;
    }

    ^buttons{
      margin-right: 8px;
    }

    ^ .foam-u2-borders-CardBorder {
      border: 1px solid /*%GREY4%*/ #DADDE2;
      border-radius: 4px;
      box-sizing: border-box;
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
      height: 100%;
      padding: 0;
    }
  `,

  messages: [
    { name: 'VIEW_ALL', message: 'View all ' },
    { name: 'ACTIONS', message: 'Actions' }
  ],

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
        return foam.comics.v2.DAOControllerConfig.create({ dao: this.data });
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
    },
    {
      class: 'Boolean',
      name: 'showNav',
      value: true
    },
    {
      name: 'viewTitle',
      expression: function(config) {
        var menuID = this.currentMenu ? this.currentMenu.id : config.of.id;
        return this.translationService.getTranslation(foam.locale, menuID + '.browseTitle', config.browseTitle);
      }
    }
  ],

  actions: [
    {
      name: 'create',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.dao.Operation.CREATE, data);

            return this.auth.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
      isAvailable: function(config) {
        try {
          return config.createPredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        if ( ! this.stack ) return;

        if ( this.config.createController.class === 'foam.comics.v2.DAOCreateView' ) {
          this.stack.push(this.StackBlock.create({
            view: {
              class: this.config.createController.class,
              data: ((this.config.factory && this.config.factory$cls) ||  this.data.of).create({ mode: 'create'}, this),
              config$: this.config$,
              of: this.data.of
            }, parent: this
          }));
        } else if ( this.config.createControllerView ) {
          this.stack.push(this.StackBlock.create({ view: this.config.createControllerView, parent: this }));
        } else {
          this.stack.push(this.StackBlock.create({
            view: {
              class: this.config.createController.class,
              config$: this.config$,
              of: this.data.of,
              data: this.selection,
              detailView: this.config.detailView.class,
              menu: this.config.menu,
              controllerMode: foam.u2.ControllerMode.CREATE,
              isEdit: true
            }, parent: this
          }));
        }
      }
    }
  ],

  methods: [
    function render() {
    this.SUPER();

    var self = this;
    var menuId = this.currentMenu ? this.currentMenu.id : this.config.of.id;
    var nav = this.showNav ? self.BreadcrumbView : '';
    this.addClass()

      .add(this.slot(function(data, config, config$of, config$browseBorder, config$browseViews, config$browseTitle, config$primaryAction, config$createTitle, config$createControllerView, config$browseContext) {
        return self.E()
          .start(self.Rows)
            .addClass(self.myClass('container'))
              .start()
                .addClass(self.myClass('header-container'))
                .tag(nav)
                .start(self.Cols)
                  .start()
                    .addClasses(['h100', self.myClass('browse-title')])
                    .translate(menuId + ".browseTitle", config$browseTitle)
                  .end()
                  .start(self.Cols)
                    .callIf( config.browseActions.length && config.browseContext, function() {
                      if ( config.browseActions.length > 2 ) {
                        this.start(self.OverlayActionListView, {
                          label: this.ACTIONS,
                          data: config.browseActions,
                          obj: config$browseContext
                        }).addClass(self.myClass('buttons')).end();
                      } else {
                        var actions = this.E().addClass(self.myClass('buttons')).startContext({ data: config.browseContext });
                        for ( action of config.browseActions ) {
                          actions.tag(action, { size: 'LARGE' });
                        }
                        this.add(actions.endContext());
                      }
                    })
                    .callIf( ! config.detailView, function() {
                      this.startContext({ data: self })
                        .tag(self.CREATE, {
                            label: this.translationService.getTranslation(foam.locale, menuId + '.createTitle', config$createTitle),
                            buttonStyle: foam.u2.ButtonStyle.PRIMARY,
                            size: 'LARGE'
                        })
                      .endContext()
                    })
                    .callIf( config.createControllerView, function() {
                      this.startContext({ data: self })
                        .tag(self.CREATE, {
                            label: this.translationService.getTranslation(foam.locale, menuId + '.handler.createControllerView.view.title', config$createControllerView.view.title),
                            buttonStyle: foam.u2.ButtonStyle.PRIMARY,
                            size: 'LARGE'
                        })
                      .endContext();
                    })
                    .callIf( config$primaryAction, function() {
                      this.startContext({ data: self }).tag(config$primaryAction, { size: 'LARGE', buttonStyle: 'PRIMARY' }).endContext();
                    })
                  .end()
                .end()
              .end()
            .start(self.CardBorder)
              .style({ position: 'relative', 'min-height': config.minHeight + 'px' })
              .start(config$browseBorder)
                .callIf(config$browseViews.length > 1 && config.cannedQueries.length > 0, function() {
                  this
                    .start(self.IconChoiceView, {
                      choices:config$browseViews.map(o => [o.view, o.icon]),
                      data$: self.browseView$
                    })
                      .addClass(self.myClass('altview-container'))
                    .end();
                })
                .call(function() {
                  this.add(self.slot(function(browseView) {
                    return self.E().tag(browseView, { data: data, config: config });
                  }));
                })
              .end()
            .end()
          .end();
      }));
    }
  ]
});
