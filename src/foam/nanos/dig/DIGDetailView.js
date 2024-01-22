/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DIGDetailView',
  extends: 'foam.u2.View',

  imports: [
    'data as dig'
  ],


  methods: [
    function render() {
      var daoKey = this.dig.daoKey;
      var dao    = this.__context__[daoKey];
      var of     = dao.of;
      var data   = of.create({}, this);
      var props  = of.getAxiomsByClass(foam.core.Property).filter(p => p.cls_ !== foam.dao.OneToManyRelationshipProperty && p.cls_ !== foam.dao.ManyToManyRelationshipProperty);

      this.tag({class: 'foam.u2.DetailView', data: data, properties: props, showActions: false});

      var update = () => this.data = foam.json.Dig.stringify(data);

      // Subscribe to property changes
      data.sub('propertyChange', update);

      // Subscribe to property changes of FObject Properties
      props.forEach(p => {
        try {
          p.get(data).sub('propertyChange', update);
        } catch (x) {
          // Probably wasn't an FObjectProperty, so don't worry about it
        }
      });
    }
  ]
});
