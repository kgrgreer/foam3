/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadReferenceView',
  extends: 'foam.u2.View',

  documentation: `
    A read-only view for a reference property that creates a link on this reference property.
    
    -- How to configure the link -- 
        - Use enableLink and menuKeys to configure the link.
          - To disable the link, set enableLink to false.
          - To set the link to a custom menu, you can provide a list of menus to 'menuKeys'. The first menu
            with permission in the list will be set to the link. If no menus are permissioned, the link will
            be disabled.
          - If enableLink and menuKeys are not set, the link will be set to dao summary view if you have
            service.{prop.targetDaoKey}. Otherwise, the link will be disabled.
        - Flow chart for how the links are set

                                                      enableLink is
                                                      set to true ?
                                                      /          \
                                                   y /            \ n
                                                    /              \
                                              - - -                 - - - - - - - - - - - - - -
                                            /                                                  \
                                      menus provided ?                                      disable link
                                        /      \   n
                                     y /         - - - - - - - - - - - - - - - - -
                                      /                                            \
                              have a menu with                            have permission to    
                                permission ?                          service.{prop.targetDAOKey}?
                                 /       \   n                                   /     \     n
                              y /          - - - - - -                        y /        - - - - -
                               /                       \                       /                   \
                    Is the menu dao Menu and      disable link           enable link           disable link
                    dao Menu daoKey matches                           link to daoSummary
                    prop.targetDAOKey ?
                        /      \  n
                     y /        - - - - - -
                      /                     \
                enable link            enable link
              link to daoSummary     link to the menu

    -- Where to set enableLink and menuKeys --
        - enableLink and menuKeys can be set directly to reference property or
          they can be passed to the view. 
          Warning: Do not try to do both or it may result in unexpected behaviours.
    
        1. setting properties on reference property

        {
          class: 'Reference',
          of: 'foam.nanos.auth.Group',
          name: 'group',
          menuKeys: [
            'someMenuId',
            'someMenuId2'
          ]
        }

        2. passing properties to view

        class: 'Reference',
        of: 'foam.nanos.auth.Group',
        name: 'group',
        view: {
          class: 'foam.u2.view.ReadReferenceView',
          menuKeys: [
            'someMenuId',
            'someMenuId2'
          ]
        }
  `,

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.detail.SectionedDetailView',
    'foam.u2.view.ReferenceCitationView'
  ],

  axioms: [foam.pattern.Faceted.create()],

  properties: [
    'obj',
    {
      name: 'of',
      expression: function (obj) {
        return obj.cls_;
      }
    },
    'prop',
    {
      class: 'String',
      name: 'linkTo',
      documentation: `
        A reference view anchor link.
        This will be set to either 'daoSummary', a menu in menuKeys, or an empty string.
        If set to 'daoSummary', the link will be to reference property's dao summary view.
        If set to a menu, the link will be to this menu.
        If set to an empty string, the link will be disabled.
      `
    },
    {
      class: 'Boolean',
      name: 'enableLink',
      documentation: `
        Create the reference view as an anchor link to the reference's DetailView or provided menu.
      `,
      value: true
    },
    {
      name: 'menuKeys',
      documentation: `
        A list of menu ids.
        The link will reference to the first menu to which you have permission
        in this list. If no menus are permissioned, the link will be disabled.
      `,
      expression: function(prop) {
        // set default menuKeys for group, nature code and capability
        switch (prop.targetDAOKey) {
          case 'groupDAO':
            return ['admin.groups'];
          case 'natureCodeDAO':
            return ['admin.natureCodes'];
          case 'capabilityDAO':
            return ['admin.capabilities'];
          default:
            return null;
        }
      }
    }
  ],

  imports: [
    'ctrl',
    'menuDAO',
    'pushMenu',
    'stack'
  ],

  methods: [
    {
      name: 'render',
      code: function() {
        var self = this;
        this.SUPER();
        this.add(
          this.obj$.map((obj) => {
            if ( ! obj ) return '';

            if ( this.enableLink ) {
              return this.E()
                .start('a')
                  .attrs({ href: '#' })
                  .on('click', (evt) => {
                    evt.preventDefault();
                    if ( self.linkTo === 'daoSummary' ) {
                      const pred = foam.mlang.predicate.False.create();

                      self.stack.push(
                        {
                          class: 'foam.comics.v2.DAOSummaryView',
                          data: self.obj,
                          of: self.obj.cls_,
                          backLabel: 'Back',
                          config: self.DAOControllerConfig.create({
                            daoKey: self.prop.targetDAOKey,
                            createPredicate: pred,
                            editPredicate: pred,
                            deletePredicate: pred,
                            editEnabled: false
                          })
                        },
                        self
                      );
                      // link to a menu
                    } else {
                      self.pushMenu(self.linkTo);
                    }
                  })
                  .tag(self.ReferenceCitationView, { data: obj })
                .end();
            } else {
              return this.E()
                .start()
                  .tag(self.ReferenceCitationView, { data: obj })
                .end();
            }
          })
        );
      }
    },

    function fromProperty(prop) {
      this.SUPER(prop);

      this.prop = prop;

      // set link config properties
      // first figure out where these properties were provided (i.e., set to reference property or passed to this view)
      this.enableLink = this.prop.enableLink && this.enableLink;
      this.menuKeys = this.prop.menuKeys || this.menuKeys;

      this.configLink().then(() => {
        const dao = this.ctrl.__subContext__[prop.targetDAOKey];
        if ( dao ) {
          dao.find(this.data).then((o) => (this.obj = o));
        }
      });
    },

    async function configLink() {
      // enableLink set to false?
      if ( ! this.enableLink ) {
        this.enableLink = false;
        this.linkTo = '';
        return;
      }

      try {
        // menus are provided?
        if ( this.menuKeys ) {
          // check permissions for menus
          const permissions = await Promise.all(
            [...this.menuKeys].map((menuId) => {
              return this.menuDAO.find(menuId); 
            })
          );

          const firstMenu = permissions.find(p => p);
          // have a menu with permission?
          if ( firstMenu ) {
            this.enableLink = true;
            // if menu is dao menu and daoKey matches prop's targetDAOkey, set link to dao summary
            if (
              firstMenu.handler &&
              firstMenu.handler.config &&
              firstMenu.handler.config.daoKey === this.prop.targetDAOKey
            ) {
              this.linkTo = 'daoSummary';
            } else {
              this.linkTo = firstMenu.id;
            }
          } else {
            this.enableLink = false;
            this.linkTo = '';
          }
        // menus not provided
        } else {
          // have permission to service.{prop.targetDAOKey} ?
          if ( this.__subContext__[this.prop.targetDAOKey] ) {
            this.enableLink = true;
            this.linkTo = 'daoSummary';
          } else {
            this.enableLink = false;
            this.linkTo = '';
          }
        }
      } catch (e) {
        console.error(e);
        this.enableLink = true;
        this.linkTo = 'daoSummary';
      }
    }
  ]
});
