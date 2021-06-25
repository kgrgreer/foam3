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
    
    Use 'enableLink' and 'menuKeys' to configure the link.
      - To disable the link, set 'enableLink' to false.
      - To have the link to a custom menu, you can provide a list of menus to 'menuKeys'.
      - If none of them are provided, the link will default to reference's dao summary view (permission required).
  
    'enableLink' and 'menuKeys' can be set directly to reference property or
    they can be passed to the view. 
    Warning: Do not try to do both or it will result in an unexpected behaviour.
    
    1. setting properties on reference property

    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'group',
      enableLink: false,
      menuKeys: [
        'someMenuId',
        'someMenuId2'
      ]
    }

    2. passing properties to view

    view: {
      class: 'foam.u2.view.ReadReferenceView',
      enableLink: false,
      menuKeys: [
        'someMenuId',
        'someMenuId2'
      ]
    }

    A flow chart for determining access to the link + what view the link is linked to

                                         enableLink is
                                         set to true ?
                                         /          \
                                      y /            \ n
                                       /              \
                                  - - -                - - - - - - - - - - - - - -
                                 /                                                 \
                          menus provided ?                                      disable link
                            /      \   n
                         y /         - - - - - - - - - - - - - -
                          /                                      \
                   have a menu with                             can read   
                   read permission ?                          DAO summary ?
                    /            \   n                           /     \       n
                 y /              - - -                       y /        - - - - -
                  /                     \                      /                   \
              enable link          disable link          enable link          disable link
            link to this menu                        link to dao summary

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
        This will be set to either 'daoSummary', a menu in menuKyes, or an empty string.
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
      class: 'StringArray',
      name: 'menuKeys',
      documentation: `
        A list of menu ids.
        The link will reference to the first menu to which group has permission
        in this list. If no menus are permissioned, the link will be disabled.
      `
    }
  ],

  imports: ['auth?', 'ctrl', 'pushMenu', 'stack'],

  methods: [
    {
      name: 'initE',
      code: function () {
        var self = this;
        this.SUPER();
        this.add(
          this.obj$.map((obj) => {
            if (!obj) return '';

            if (this.enableLink) {
              return this.E()
                .start('a')
                .attrs({ href: '#' })
                .on('click', (evt) => {
                  evt.preventDefault();
                  if (self.linkTo === 'daoSummary') {
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
      this.menuKeys =
        this.prop.menuKeys.length > 0 ? this.prop.menuKeys : this.menuKeys;

      this.configLink().then(() => {
        const dao = this.ctrl.__subContext__[prop.targetDAOKey];
        if (dao) {
          dao.find(this.data).then((o) => (this.obj = o));
        }
      });
    },

    async function configLink() {
      /*
       * Uses the flow chart above to control access to the link
       * and to which view the link is linked.
       */

      // enableLink explicitly set to false?
      if (!this.auth || !this.enableLink) {
        this.enableLink = false;
        this.linkTo = '';
        return;
      }

      try {
        // menus are provided?
        if (this.menuKeys.length > 0) {
          // check permissions for menus
          const permissions = await Promise.all(
            [...this.menuKeys].map((menuId) => {
              return this.auth.check(
                this.__subContext__,
                `menu.read.${menuId}`
              );
            })
          );

          const firstAt = permissions.indexOf(true);
          // can read menu?
          if (firstAt > -1) {
            this.enableLink = true;
            this.linkTo = this.menuKeys[firstAt];
          } else {
            this.enableLink = false;
            this.linkTo = '';
          }
          // menus not provided
        } else {
          // access to dao summary?
          if (
            await this.auth.check(
              this.__subContext__,
              `service.${this.prop.targetDAOKey}`
            )
          ) {
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
