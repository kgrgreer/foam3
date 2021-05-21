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
    A read-only view for a Reference Property.
    
    You can configure 'enableLink' and/or 'menus' when creating this view to
    enable/disable the link and/or set different menu to the link
    
      - To use default dao summary, do not set the two
      
      - To disable the link, set 'enableLink' to false. In this case,
        providing menus won't have any effect

      - To enable the link only when group has permission to a menu, 
        provide 'menus' to this view
        
        - If there are more than one menu to which group has permission, then the first menu
          will be set to the link.

        - If there are no menu to which group has permission, then the link will be disabled. 

        e.g. enable the link based on group permission to dao summary
        
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'user',
          view: {
            class: 'foam.u2.view.ReferencePropertyView',
            readView: {
              class: 'foam.u2.view.ReadReferenceView',
              menus: [
                'daoSummary'
              ]
            }
          }
        }

      * tree diagram for finding 'enableLink' and 'linkTo'

              enableLink set to false ?
                     /          \
                y   /            \ n
                   /              \
              - - -                - - - - - - - -
             /                                     \
        disable link                            menus provided ?
         no link to                                 /      \   n
                                                 y /        - - - - - - - - - - -
                                                  /                               \
                                            has menu with                         enable link   
                                           read permission ?                     link to default
                                             /        \      n                
                                          y /          - - - - - - -
                                           /                         \       
                                        enable link               disable link
                                      link to this menu             no link to
  `,

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.detail.SectionedDetailView',
    'foam.u2.view.ReferenceCitationView'
  ],

  properties: [
    'obj',
    'prop',
    {
      class: 'Boolean',
      name: 'enableLink',
      documentation: `
        Create the reference view as an anchor link to the reference\'s DetailView or provided menu.
        Please read the model documentation for more info.
      `,
      value: true
    },
    {
      class: 'Boolean',
      name: 'controlAccessToDAOSummary',
      documentation: `
        when set to true, DAO summary can be only viewed if group has permission to read it
      `,
      value: false
    },
    {
      class: 'StringArray',
      name: 'menuKeys',
      documentation: `
        A list of menu ids. Please read the model documentation for more info.
      `
    },
    {
      class: 'String',
      name: 'linkTo',
      documentation: 'link to the reference'
    }
  ],

  imports: [
    'auth?',
    'ctrl',
    'pushMenu',
    'stack'
  ],

  methods: [
    {
      name: 'initE',
      code: function() {
        var self = this;
        this.SUPER();
        this
          .add(this.obj$.map(obj => {
            if ( ! obj ) return '';

            if ( this.enableLink ) {
              return this.E().start('a')
                .attrs({ href: '#'})
                .on('click', evt => {
                  evt.preventDefault();
                  
                  if ( self.linkTo === 'daoSummary' ) {
                    self.stack.push({
                      class: 'foam.comics.v2.DAOSummaryView',
                      data: self.obj,
                      of: self.obj.cls_,
                      backLabel: 'Back',
                      config: self.DAOControllerConfig.create({
                        daoKey: self.prop.targetDAOKey
                      })
                    }, self);
                  // link to a menu
                  } else {
                    self.pushMenu(self.linkTo);
                  }
                })
                .tag(self.ReferenceCitationView, {data: obj})
              .end();
            } else {
              return this.E().start()
              .tag(self.ReferenceCitationView, {data: obj})
              .end();
            }
          }));
      }
    },

    function fromProperty(prop) {
      this.SUPER(prop);
      
      this.prop = prop;

      this.getLink().then(() => {
        const dao = this.ctrl.__subContext__[prop.targetDAOKey];
        if ( dao ) {
          dao.find(this.data).then((o) => this.obj = o);
        }
      });
    },

    async function getLink() {
      /*
       * Uses the tree diagram above to set enableLink and linkTo
       */

      // enableLink explicitly set to false?
      if ( ! this.auth || ! this.enableLink ) {
        this.enableLink = false;
        this.linkTo = '';
        return;
      }      
      
      // menus are provided?
      if ( this.menuKeys.length > 0 ) {
        try {
          // get a permission for menus
          const permissions = await Promise.all([...this.menuKeys].map(menuId => {
            return this.auth.check(this.__subContext__, `menu.read.${menuId}`);
          }));

          const firstAt = permissions.indexOf(true);
          // can read menu?
          if ( firstAt > -1 ) {
            this.enableLink = true;
            this.linkTo = this.menuKeys[firstAt];
          } else {
            // access to dao summary?
            if (
              ! this.controlAccessToDAOSummary ||
              await this.auth.check(this.__subContext__, 'daoSummary.read')
            ) {
              this.enableLink = true;
              this.linkTo = 'daoSummary';
            } else {
              this.enableLink = false;
              this.linkTo = '';
            }
          }
        } catch (e) {
          console.warn('something went wrong, enable access to dao summary');
          this.enableLink = true;
          this.enableLinkToDAOSuammry = true;
          this.linkTo = 'daoSummary';
        }
      // menus not provided
      } else {
        // access to dao summary?
        if (
          ! this.controlAccessToDAOSummary ||
          await this.auth.check(this.__subContext__, 'daoSummary.read')
        ) {
          this.enableLink = true;
          this.linkTo = 'daoSummary';
        } else {
          this.enableLink = false;
          this.linkTo = '';
        }
      }
    },
  ]
});
