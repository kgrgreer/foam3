/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'DAOView',
  extends: 'foam.u2.View',

  imports: [
    'auth',
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
    async function render() {
      this.SUPER();
      var self = this;
      this.config.createMenu$find.then(v => {
        this.onDetach(this.stack.setTrailingContainer(
          this.E()
            .callIfElse(v, function() {
              this.startContext({ data: self }).tag(v, { buttonStyle: 'PRIMARY', size: 'LARGE' }).endContext();
            }, function() {
              this.startContext({ data: self })
                .tag(self.CREATE, { label$: self.config$.dot('createTitle'), size: 'LARGE' })
              .endContext()
            })
        ))
      });
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
  ],

  actions: [
    {
      name: 'create',
      buttonStyle: 'PRIMARY',
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
      code: function(x) {
        x.daoController.route = 'create';
      }
    }
  ],
});