foam.CLASS({
  package: 'foam.u2',
  name: 'SpecifiedView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.SimpleSlot'
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'realView'
    },
    {
      class: 'Map',
      name: 'loaders',
      documentation: `
        A map of strings to loaders. Each loader will load onto the respective
        property (named by the map key) on the underlying real view.
      `
    },
    {
      class: 'Map',
      name: 'values_',
      documentation: `
        Actual values used in the view - this is populated by loaders.
      `
    }
  ],

  methods: [
    async function doLoad_ () {
      const values = {};
      const promises = [];
      for ( const k in this.loaders ) {
        // loader is a spec (because it's a map value from a journal)
        const loader = foam.util.FObjectSpec.createFObject(
          this.loaders[k], {}, this, this.__subContext__);

        promises.push(loader.load().then(value => {
          values[k] = value;
        }));
      }
      await Promise.all(promises);
      this.values_ = values;
    },
    function render() {
      this.doLoad_();
      this.add(this.slot(function (values_) {
        this.tag(this.realView, values_);
      }));
    }
  ]
})
