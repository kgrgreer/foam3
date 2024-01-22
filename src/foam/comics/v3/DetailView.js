/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'DetailView',
  extends: 'foam.u2.View',
  mixins: ['foam.u2.memento.Memorable'],

  documentation: `Experimental new detail view that uses controller mode for a more seamless view/edit experience
  and offers more customisation while simplifying the code`,

  axioms: [
    foam.pattern.Faceted.create()
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.Popup',
    'foam.u2.stack.BreadcrumbView',
    'foam.u2.stack.StackBlock'
  ],

  imports: [
    'auth?',
    'config? as importedConfig',
    'currentMenu?',
    'currentControllerMode?',
    'notify',
    'setControllerMode?',
    'stack?'
  ],

  exports: [
    'controllerMode'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  css: `
    ^ {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    ^main {
      height: min(600px,100%);
      padding: 24px 32px;
    }
    ^widget-container {
      width: 100%;
      display: grid;
      flex-grow: 1;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      name: 'workingData',
      expression: function(data) {
        return data?.clone(this);
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return importedConfig || foam.comics.v2.DAOControllerConfig.create({}, this);
      }
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      name: 'primary',
      documentation: `Axiom to store the primary action of the 'of' model`,
      expression: function(config$of, data) {
        var allActions = config$of.getAxiomsByClass(foam.core.Action);
        var defaultAction = allActions.filter((a) => a.isDefault);
        var acArray = defaultAction.length >= 1
          ? defaultAction
          : allActions.length >= 1
            ? allActions
            : null;
        if ( acArray && acArray.length ) {
          let res;
          acArray.forEach(a => {
            var aSlot = a.createIsAvailable$(this.__subContext__, data);
            if (aSlot.get()) res = a;
          });
          return res;
        }
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      factory: function() {
        return this.config?.detailView ?? foam.u2.detail.TabbedDetailView;
      }
    },
    {
      name: 'onBack',
      factory: function() {
        return () => this.stack.back();
      }
    },
    {
      class: 'String',
      name: 'route',
      memorable: true,
      documentation: 'This stores the id we want to add to the memento of the view',
      factory: function() {
          if ( ! this.idOfRecord )
            return '';
          var id = '' + this.idOfRecord;
          if ( id && foam.core.MultiPartID.isInstance(this.config.of.ID) ) {
            id = id.substr(1, id.length - 2).replaceAll(':', '=');
          }
          return id;
      },
      postSet: function(_,n) {
        if ( ! this.idOfRecord && n ) this.idOfRecord = n;
      }
    },
    {
      name: 'idOfRecord',
      factory: function() {
        return this.route ? this.route : this.data ? this.data.id : null;
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
    },
    {
      name: 'translationService',
      factory: function() {
        return this.context.translationService || foam.i18n.NullTranslationService.create({}, this);
      }
    },
  ],

  methods: [
    function init() {
      // This is needed to ensure data is available for the viewTitle
      this.SUPER();
      var self = this;
      var id = this.data?.id ?? this.idOfRecord;
      self.config.unfilteredDAO.inX(self.__subContext__).find(id).then(d => {
        self.data = d;
        if ( self.currentControllerMode == 'edit' ) self.edit();
      });
    },
    function render() {
      var self = this;
      this.SUPER();
      // if ( this.setControllerMode ) this.setControllerMode('view');
      this
      .addClass(this.myClass())
      .add(self.slot(function(config$viewBorder, viewView) {
        return self.E()
          .start(self.Rows)
            .start(self.Rows)
              // we will handle this in the StackView instead
              .startContext({ onBack: self.onBack })
                .tag(self.BreadcrumbView)
              .endContext()
              .start(self.Cols).style({ 'align-items': 'center', 'margin-bottom': '32px' })
                .start()
                  .add(self.data$.map(v => { return v?.toSummary() ?? '---' }))
                  .addClass('dao-title')
                  .addClass('truncate-ellipsis')
                .end()
                .startContext({ data: self.data }).tag(self.primary, { buttonStyle: 'PRIMARY' }).endContext()
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
                  .tag(self.CANCEL_EDIT, {
                    buttonStyle: foam.u2.ButtonStyle.LINK,
                  })
                  .tag(self.SAVE, {
                    buttonStyle: foam.u2.ButtonStyle.LINK,
                  })
                .endContext()
              .end()
            .end()
            .start(config$viewBorder)
              .start(viewView, {
                data$: self.slot(function(controllerMode, data, workingData) { return controllerMode == 'EDIT' ? workingData : data }),
                memento_$: self.memento_$
              })
                .addClass(self.myClass('view-container'))
              .end()
            .end()
          .end();
      }));
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

            return this.auth?.check(null, permissionString) && this.data;
          } catch(e) {
            return false;
          }
        }
        return this.data;
      },
      isAvailable: function(config, controllerMode) {
        if ( controllerMode == 'EDIT' ) return false;
        try {
          return config.editPredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        this.controllerMode = 'EDIT';
        this.setControllerMode('edit');
      }
    },
    {
      name: 'copy',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.dao.Operation.CREATE, data);

            return this.auth?.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
      isAvailable: function(config, controllerMode) {
        if ( controllerMode == 'EDIT' ) return false;
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
      name: 'save',
      isEnabled: function(workingData$errors_) {
        return ! workingData$errors_;
      },
      isAvailable: function(controllerMode) {
        return controllerMode == 'EDIT';
      },
      code: function() {
        this.config.dao.put(this.workingData).then(o => {
          if ( ! this.data.equals(o) ) {
            this.data = o;
            this.finished.pub();
            if ( foam.comics.v2.userfeedback.UserFeedbackAware.isInstance(o) && o.userFeedback ) {
              var currentFeedback = o.userFeedback;
              while ( currentFeedback ) {
                this.notify(currentFeedback.message, '', this.LogLevel.INFO, true);
                currentFeedback = currentFeedback.next;
              }
            } else {
              var menuId = this.currentMenu ? this.currentMenu.id : this.config.of.id;
              var title = this.translationService.getTranslation(foam.locale, menuId + '.browseTitle', this.config.browseTitle);

              this.notify(title + " " + this.UPDATED, '', this.LogLevel.INFO, true);
            }
          }
          this.cancelEdit();
        }, e => {
          this.throwError.pub(e);

          if ( e.exception && e.exception.userFeedback  ) {
            var currentFeedback = e.exception.userFeedback;
            while ( currentFeedback ) {
              this.notify(currentFeedback.message, '', this.LogLevel.INFO, true);

              currentFeedback = currentFeedback.next;
            }
            this.cancelEdit();
          } else {
            this.notify(e.message, '', this.LogLevel.ERROR, true);
          }
        });
      }
    },
    {
      name: 'cancelEdit',
      label: 'cancel',
      isAvailable: function(controllerMode) {
        return controllerMode == 'EDIT';
      },
      code: function() {
        this.controllerMode = 'VIEW';
        this.setControllerMode('view');
      }
    },
    {
      name: 'delete',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.dao.Operation.REMOVE, data);

            return this.auth?.check(null, permissionString);
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
  ]
});
