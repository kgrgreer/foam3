/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'CreateView',
  extends: 'foam.u2.View',
  mixins: ['foam.u2.Router'],

  topics: [
    'finished',
    'throwError'
  ],

  documentation: `
    A configurable view to create an instance of a specified model
  `,

  axioms: [
    foam.pattern.Faceted.create()
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.ButtonGroup',
    'foam.u2.ControllerMode'
  ],

  imports: [
    'currentMenu?',
    'daoController?',
    'notify',
    'stack',
    'translationService'
  ],

  exports: [
    'controllerMode'
  ],

  messages: [
    { name: 'CREATED', message: 'Created' }
  ],

  css: `
    ^buttonGroup {
      justify-content: flex-end;
    }
  `,

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
        return this.ControllerMode.CREATE;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      factory: function() {
        return this.config.createView;
      }
    },
    {
      class: 'String',
      name: 'mementoHead',
      value: 'create'
    },
    'currentMemento_'
  ],

  actions: [
    {
      name: 'save',
      buttonStyle: 'PRIMARY',
      isEnabled: function(data$errors_) {
        let enabled = ! data$errors_;
        if ( ! enabled ) {
          console.error('Save disabled:', data$errors_);
        }
        return enabled;
      },
      toolTipFn: function(data$errors_) {
        let hasErrors = !! data$errors_;
        if ( hasErrors ) {
          function printErrors(errors_) {
            return errors_.map(e => `<li><b>${e[0].label}</b>: ${e[1]}</li>`).join('');
          }
          return 'Save is disabled due to the following validation errors:<br /><ul>' + printErrors(data$errors_) + '</ul>';
        }
        return '';
      },
      code: function() {
        var cData = this.data;

        return this.config.dao.put(cData).then(o => {
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
            var title = this.translationService.getTranslation(foam.locale, menuId + '.browseTitle', ( this.config.of?.model_?.label || this.config.browseTitle ));

            this.notify(title + ' ' + this.CREATED, '', this.LogLevel.INFO, true);
          }
          this.daoController && (this.daoController.route = o.id);
        }, e => {
          this.throwError.pub(e);

          if ( e.exception && e.exception.userFeedback  ) {
            var currentFeedback = e.exception.userFeedback;
            while ( currentFeedback ) {
              this.notify(currentFeedback.message, '', this.LogLevel.INFO, true);

              currentFeedback = currentFeedback.next;
            }

          } else {
            this.notify(e.message, '', this.LogLevel.ERROR, true);
          }
        });
      }
    },
    {
      name: 'cancel',
      code: async function() {
        // NOTE: ideally, if the user has made any changes, Cancel would prompt a
        // "changes will be lost — confirm?" dialog before discarding. The comics Edit
        // flow doesn't do this either, so it's best tackled as a separate issue and
        // applied consistently to both.
        //
        // The new object was never put to the DAO, so there's nothing to clean up.
        // Return to the browse list by clearing the controller's route — the controller
        // now pops the pushed create view on that route change.
        //
        // Use routeToMe() rather than `route = ''`: an EMPTY route also triggers the
        // Router's routeChange → crumb.go() breadcrumb navigation, which races with the
        // controller's own route dynamic and makes cancel intermittent. routeToMe()
        // clears the route under the routingFeedback_ guard, so routeChange early-returns
        // and only the controller's route dynamic runs. (daoController is optional — save
        // guards it too — so pop the stack directly without it.)
        if ( this.daoController ) this.daoController.routeToMe();
        else await this.stack.pop();
      }
    }
  ],

  methods: [
    function render() {
      var self = this;
      this.SUPER();
      this.stack.setTitle(self.slot('config$createTitle'), this);
      this.onDetach(this.stack.setTrailingContainer(this.ButtonGroup.create({}, this).addClass(this.myClass('buttonGroup')).startContext({ data: this }).tag(this.SAVE).tag(this.CANCEL).endContext()));

      this
        .addClass(this.myClass())
        .start(this.config.viewBorder)
          .start().addClass(this.myClass('create-view-container'))
            .tag(this.viewView, { data$: self.data$ })
          .end()
        .end();
    }
  ]
});
