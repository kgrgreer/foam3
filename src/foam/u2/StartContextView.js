foam.CLASS({
  package: 'foam.u2',
  name: 'StartContextView',
  extends: 'foam.u2.View',
  documentation: `
    Use this in a viewspec to specify manual overrides for context values.
  `,

  properties: [
    {
      class: 'Map',
      name: 'value'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'delegateSpec',
      // postSet: function (o, n) {
      //   this.delegate = foam.u2.ViewSpec.createView(n, {
      //     data$: this.data$
      //   }, this, this);
      // }
    }
  ],

  methods: [
    function render() {
      this.addClass()
        .startContext(this.value)
          .tag(this.delegateSpec, { data$: this.data$ })
        .endContext()
    },
    function output_(out) {
      this.outputInnerHTML(out);
    }
  ]
});
