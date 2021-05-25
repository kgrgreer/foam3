/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadReferenceView',
  extends: 'foam.u2.View',

  documentation: 'A read-only view for a Reference Property.',

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
      documentation: 'Create the reference view as an anchor link to the reference\'s DetailView.',
      value: true
    }
  ],

  imports: [
    'auth?',
    'ctrl',
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
                .on('click', function(evt) {
                  evt.preventDefault();
                  self.stack.push({
                    class:     'foam.comics.v2.DAOSummaryView',
                    data:      self.obj,
                    of:        self.obj.cls_,
                    backLabel: 'Back',
                    config: self.DAOControllerConfig.create({
                      daoKey: self.prop.targetDAOKey
                    })
                  }, self);
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
      var dao = this.ctrl.__subContext__[prop.targetDAOKey];
      this.permissionEnableLinkCheck().then(() => {
        if ( dao )
          dao.find(this.data).then((o) => this.obj = o);
      });
    },

    async function permissionEnableLinkCheck() {
      if ( ! this.auth ) return;
      let permission = `${this.prop.of.id}.${this.prop.name}.disableRefLink`;
      permission = permission.toLowerCase();
      await this.auth.check(this.__subContext__, permission).then( check => {
        this.enableLink = ! check;
      })
    }
  ]
});
