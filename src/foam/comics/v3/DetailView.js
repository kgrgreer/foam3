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
    ^buttonGroup {
      flex: 2 0 fit-content;
      justify-content: flex-end;
    }
    ^buttonGroup .foam-u2-view-OverlayActionListView-iconOnly {
      padding: 6px;
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
        return data?.clone(this) ?? this.config.of.create({}, this);
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.importedConfig || foam.comics.v2.DAOControllerConfig.create({}, this);
      }
    },
    {
      name: 'controllerMode',
      shortName: 'mode',
      memorable: true,
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      name: 'primary',
      documentation: `Axiom to store the primary action of the 'of' model`
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
      name: 'idOfRecord',
      factory: function() {
        return this.data ? this.data.id : null;
      }
    },
    'actionArray',
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
        this.__subContext__.controlBorder.viewTitle = maybePromise;
        return maybePromise;
      }
    },
    {
      name: 'translationService',
      factory: function() {
        return this.__context__.translationService || foam.i18n.NullTranslationService.create({}, this);
      }
    },
    // TODO: routeable props and actions on data
  ],

  methods: [
    function init() {
      // This is needed to ensure data is available for the viewTitle
      this.SUPER();
      var self = this;
      var id = this.data?.id ?? this.idOfRecord;
      self.config.unfilteredDAO.inX(self.__subContext__).find(id).then(d => {
        self.data = d;
        if ( this.controllerMode == 'EDIT' ) this.edit();
        this.populatePrimaryAction(self.config.of, self.data);

      });
    },
    function render() {
      var self = this;
      this.SUPER();
      this
      .add(self.slot(function(config$viewBorder, viewView) {
        var allActions = self.config.of.getAxiomsByClass(foam.core.Action);
        self.actionArray = allActions;
        this.onDetach(() => { this.__subContext__.controlBorder.buttonHolder.removeAllChildren() })
        this.__subContext__.controlBorder.buttonHolder.add(this.dynamic(function(actionArray, primary) {
          this.start(foam.u2.ButtonGroup, { overrides: { size: 'SMALL' }, overlaySpec: { obj: this, icon: '/images/Icon_More_Resting.svg',
              showDropdownIcon: false  }})
            .addClass(this.myClass('buttonGroup'))
            .add(self.slot(function(primary) {
              return this.E()
                .hide(self.controllerMode$.map(c => c == 'EDIT' ))
                .startContext({ data: self.data })
                  .tag(primary, { buttonStyle: 'PRIMARY', size: 'SMALL' })
                .endContext();
            }))
            .startContext({ data: self })
              .tag(self.EDIT)
              .tag(self.CANCEL_EDIT)
              .tag(self.SAVE, { buttonStyle: 'PRIMARY'})
            .endContext()
            .startOverlay()
              .forEach(self.actionArray, function(v) {
                this.addActionReference(v, self.data)
              })
              .tag(self.COPY)
              .tag(self.DELETE)
            .endOverlay()
          .end();
        }))
        return self.E().style({ display: 'contents' })
            .start(config$viewBorder)
              .start(viewView, {
                data$: self.slot(function(controllerMode, data, workingData) { return controllerMode == 'EDIT' ? workingData : data }),
              })
                .addClass(self.myClass('view-container'))
              .end()
            .end();
      }));
    },
    async function populatePrimaryAction(of, data) {
      var allActions = of.getAxiomsByClass(foam.core.Action);
      var defaultAction = allActions.filter((a) => a.isDefault);
      var acArray = defaultAction.length >= 1
        ? defaultAction
        : allActions.length >= 1
          ? allActions
          : null;
      if ( acArray && acArray.length ) {
        let res;
        for ( let a of acArray ) {
          var aSlot = a.createIsAvailable$(this.__subContext__, data);
          let b = aSlot.get();
          if ( aSlot.promise ) {
            await aSlot.promise;
            b = aSlot.get();
          }
          if (b) res = a;
        }

        this.primary = res;
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
      themeIcon: 'edit',
      icon: 'images/edit-icon.svg',
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
      }
    },
    {
      name: 'copy',
      themeIcon: 'copy',
      icon: 'images/copy-icon.svg',
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
      label: 'Cancel',
      isAvailable: function(controllerMode) {
        return controllerMode == 'EDIT';
      },
      code: function() {
        this.controllerMode = 'VIEW';
      }
    },
    {
      name: 'delete',
      themeIcon: 'trash',
      icon: 'images/delete-icon.svg',
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
      isAvailable: function(config, controllerMode) {
        if ( controllerMode == 'EDIT' ) return false;
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
