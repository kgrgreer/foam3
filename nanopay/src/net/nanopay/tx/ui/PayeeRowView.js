foam.CLASS({
    package: 'net.nanopay.tx.ui',
    name: 'PayeeRowView',
    extends: 'foam.u2.View',
  
    properties: [
      {
        name: 'data',
        documentation: 'The selected object.'
      }
    ],
  
    methods: [
      function initE() {
        return this
          .start()
            .add(this.data.email)
          .end();
      }
    ]
  });
