/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOSummaryView',
  extends: 'foam.u2.View',

  documentation: 'A configurable summary view for a specific instance',

  topics: [
    'finished',
    'throwError'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^ {
      padding: 32px
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-self: flex-start;
    }

    ^account-name {
      font-size: 3.6rem;
      font-weight: 600;
    }

    ^actions-header .foam-u2-ActionView {
      margin-right: 24px;
      line-height: 1.5
    }

    ^view-container {
      margin: auto;
    }
  `,

  requires: [
    'foam.nanos.controller.Memento',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.Popup',
    'foam.u2.stack.BreadcrumbView',
    'foam.u2.stack.StackBlock'
  ],

  imports: [
    'auth',
    'currentMenu?',
    'memento',
    'stack',
    'translationService'
  ],

  exports: [
    'controllerMode',
    'currentMemento_ as memento'
  ],

  messages: [
    { name: 'DETAIL', message: 'Detail' },
    { name: 'TABBED', message: 'Tabbed' },
    { name: 'SECTIONED', message: 'Sectioned' },
    { name: 'MATERIAL', message: 'Material' },
    { name: 'WIZARD', message: 'Wizard' },
    { name: 'VERTICAL', message: 'Vertical' },
    { name: 'ALL', message: 'All ' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      name: 'primary',
      expression: function(config$of) {
        var allActions = config$of.getAxiomsByClass(foam.core.Action);
        var defaultAction = allActions.filter((a) => a.isDefault);
        return defaultAction.length >= 1
          ? defaultAction[0]
          : allActions.length >= 1
            ? allActions[0]
            : null;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      factory: function() {
        return foam.u2.detail.TabbedDetailView;
      }
    },
    {
      class: 'String',
      name: 'backLabel',
      expression: function(config$browseTitle) {
        var allMsg = ctrl.__subContext__.translationService.getTranslation(foam.locale, 'foam.comics.v2.DAOSummaryView.ALL', this.ALL);
        var menuId = this.currentMenu ? this.currentMenu.id : this.config.of.id;
        var title = ctrl.__subContext__.translationService.getTranslation(foam.locale, menuId + '.browseTitle', config$browseTitle);
        return allMsg + title;
      }
    },
    {
      name: 'onBack',
      factory: function() {
        return () => this.stack.back();
      }
    },
    'currentMemento_',
    {
      class: 'String',
      name: 'mementoHead',
      documentation: 'This stores the id we want to add to the memento of the view',
      factory: function() {
        if ( ! this.memento || ! this.memento.tail || this.memento.tail.head != 'edit' ) {
          if ( ! this.idOfRecord )
            return '::';
          var id = '' + this.idOfRecord;
          if ( id && foam.core.MultiPartID.isInstance(this.config.of.ID) ) {
            id = id.substr(1, id.length - 2).replaceAll(':', '=');
          }
          return id;
        }
      }
    },
    {
      name: 'idOfRecord',
      factory: function() {
        return this.data ? this.data.id : null;
      }
    },
    {
      class: 'String',
      name: 'viewTitle',
      expression: function(data) {
        var self = this;
        var maybePromise = data?.toSummary() ?? '';
        if ( maybePromise.then ) { 
          maybePromise.then( v => { self.viewTitle = v })
          return '';
        }
        return maybePromise;
      }
    }
  ],

  actions: [
    {
      name: 'back',
      code: (data) => data.onBack()
    },
    {
      name: 'edit',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.dao.Operation.UPDATE, data);

            return this.auth.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
      isAvailable: function(config) {
        try {
          return config.editPredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        if ( ! this.stack ) return;
        // Wait to get data before loading edit
        if ( ! this.data ) return;

        this.stack.push(this.StackBlock.create({
          view: {
            class:  'foam.comics.v2.DAOUpdateView',
            data:   this.data,
            config: this.config,
            of:     this.config.of
          }, parent: this.__subContext__.createSubContext({ memento: this.memento })
        }));
      }
    },
    {
      name: 'copy',
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
        let newRecord = this.data.clone();
        // Clear PK so DAO can generate a new unique one
        newRecord.id = undefined;
        this.stack.push(this.StackBlock.create({
          view: {
            class: 'foam.comics.v2.DAOCreateView',
            data: newRecord,
            config: this.config,
            of: this.config.of
          }, parent: this }));
      }
    },
    {
      name: 'delete',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.dao.Operation.REMOVE, data);

            return this.auth.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
      isAvailable: function(config) {
        try {
          return config.deletePredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        this.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.DeleteModal',
          dao: this.config.dao,
          onDelete: () => {
            this.finished.pub();
            this.stack.back();
          },
          data: this.data
        }));
      }
    }
  ],

  methods: [
    function init() {
      // This is needed to ensure data is available for the viewTitle
      this.SUPER();
      var self = this;
      var id = this.data?.id ?? this.idOfRecord;
      self.config.unfilteredDAO.inX(self.__subContext__).find(id).then(d => { self.data = d; });
    },
    function render() {
      var self = this;
      this.SUPER();
      if ( this.memento ) {
        this.currentMemento_ = this.memento;
        var counter = 0;

        // counter < 2 is as at this point we need to skip 2 memento
        // head of first one will be DAOSummaryView mode
        // and second will be the id for the view
        while ( counter < 2 ) {
          if ( ! this.currentMemento_.tail ) {
            this.currentMemento_.tail = this.Memento.create();
          }
          this.currentMemento_ = this.currentMemento_.tail;
          counter++;
        }

        if ( ! this.currentMemento_ ) {
          this.currentMemento_ = foam.nanos.controller.Memento.create();
        }
      }

      // Get a fresh copy of the data, especially when we've been returned
      // to this view from the edit view on the stack.
      this.config.unfilteredDAO.inX(this.__subContext__).find(this.data ? this.data.id : this.idOfRecord).then(d => {
        if ( d ) { 
          self.data = d;
          if ( self.memento && self.memento.head && self.memento.head.toLowerCase() === 'edit' ) 
            self.edit();
        }
      });
      if ( self.memento && self.memento.head && self.memento.head.toLowerCase() === 'edit' ) {
        self.edit();
      } else {
        if ( this.memento && ! this.memento.head.startsWith('view') && this.memento.tail && ! this.memento.tail.value.startsWith(this.mementoHead) ) {
          this.memento.head = 'view';
          this.memento.tail.head = this.mementoHead;
          if ( ! this.memento.tail.tail ) 
            this.memento.tail.tail = foam.nanos.controller.Memento.create({ value: '', parent: this.memento.tail });
          this.currentMemento_ = this.memento.tail.tail;
        }
        this
        .addClass(this.myClass())
        .add(self.slot(function(data, config$viewBorder, viewView) {
          // If data doesn't exist yet return
          if ( ! data ) return;
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ onBack: self.onBack })
                  .tag(self.BreadcrumbView)
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center', 'margin-bottom': '32px' })
                  .start()
                    .add(data && data.toSummary() ? data.toSummary() : '')
                    .addClass(self.myClass('account-name'))
                    .addClass('truncate-ellipsis')
                  .end()
                  .startContext({ data }).tag(self.primary, { buttonStyle: 'PRIMARY' }).endContext()
                .end()
              .end()

              .start(self.Cols)
                .start(self.Cols).addClass(self.myClass('actions-header'))
                  .startContext({ data: self })
                    .tag(self.EDIT, {
                      buttonStyle: foam.u2.ButtonStyle.LINK,
                      themeIcon: 'edit',
                      icon: 'images/edit-icon.svg'
                    })
                    .tag(self.COPY, {
                      buttonStyle: foam.u2.ButtonStyle.LINK,
                      themeIcon: 'copy',
                      icon: 'images/copy-icon.svg'
                    })
                    .tag(self.DELETE, {
                      buttonStyle: foam.u2.ButtonStyle.LINK,
                      themeIcon: 'trash',
                      icon: 'images/delete-icon.svg'
                    })
                  .endContext()
                .end()
              .end()
              .start(config$viewBorder)
                .start(viewView, { data }).addClass(self.myClass('view-container')).end()
              .end()
            .end();
        }));
      }
    }
  ]
});
