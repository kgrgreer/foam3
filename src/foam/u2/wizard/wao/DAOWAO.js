/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'DAOWAO',
  implements: [
    'foam.mlang.Expressions',
    'foam.u2.wizard.wao.WAO'
  ],

  requires: [
    'foam.core.Slot',
    'foam.mlang.expr.Dot',
    'foam.core.Property',
  ],
  flags: ['web'],

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'daoKey',
      class: 'String',
      expression: function(of, path) {
        if ( path ) {
          const parts = path.split('.');
          let of_ = of;
          let obj = null
          for ( let part of parts ) {
            obj = of_.getAxiomByName(part);
            of = obj.cls_;
          }
          return foam.String.daoize(obj.of.name)
        }
        return foam.String.daoize(of.name);
      }
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      expression: function (daoKey) {
        return this.__context__[daoKey];
      }
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'path',
      documentation: `
        Optional path used to specify the location of the desired wizardlet's data object that will
        be updated.
      `,
    },
    {
      class: 'Boolean',
      name: 'disableFind'
    }
  ],

  methods: [
    async function save(wizardlet) {
      if ( wizardlet.loading ) return;
      if ( ! wizardlet.isAvailable ) return;
      wizardlet.loading = true;

      let dataToPut = this.path ? this.path.f(wizardlet.data) : wizardlet.data;

      return await this.dao.put(dataToPut).then(savedData => {
          this.setValue_(wizardlet, savedData);
          return savedData;
        })
      .catch(e => {
        console.error(e);
        wizardlet.reportNetworkFailure(e);
      })
      .finally(() => {
        wizardlet.loading = false;
      });
    },
    async function load(wizardlet) {
      if ( wizardlet.loading ) return;
      if ( ! this.disableFind ) {

        let dataToFind = this.path ? this.path.f(wizardlet.data) : wizardlet.data;

        if ( ! dataToFind || ( dataToFind && ! dataToFind.id ) ) return;

        let loadedData = await this.dao.find(dataToFind)
            .catch(e => {
              console.error(e);
              wizardlet.reportNetworkFailure(e);
            })
        this.setValue_(wizardlet, loadedData);
      }
      wizardlet.loading = false;

    },
    async function cancel() {
      return;
    },
    function setValue_(wizardlet, data) {
      let path = this.path;
      let lastObject = null;
      let lastKey = null;
      if ( ! path ) {
        lastObject = wizardlet;
        lastKey = 'data';
      } else if ( this.Property.isInstance(path) ) {
        lastObject = wizardlet.data;
        lastKey = path;
      } else if ( this.Dot.isInstance(path) ) {
        lastObject = path.arg1.f(obj);
        lastKey = path.arg2.name;
      } else {
        throw new Error('Unexpected case in DAOWAO.setValue');
      }
      if ( ! lastObject ) return false;
      if ( foam.core.Slot.isInstance(lastObject[lastKey]) ) {
        lastObject[lastKey] = data$;
      } else {
        lastObject[lastKey] = data;
      }
      return true;
    }
  ]
});

