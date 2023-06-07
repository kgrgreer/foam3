/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'ComparisonView',
  extends: 'foam.u2.View',
  requires: [
    'foam.core.FObject',
    'foam.u2.ModalHeader',
    'foam.u2.DetailView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.layout.Cols'
  ],

  properties: [
    {
      name: 'left',
      type: 'FObject'
    },
    {
      name: 'right',
      type: 'FObject'
    }
  ],
  methods: [
    function render() {
      this.SUPER();

      this.addClass()
      .startContext({controllerMode: foam.u2.ControllerMode.VIEW})
      .start()
        .start(this.Cols)
          .start()
            .addClass('h500')
            .add('Before')
            .tag(this.VerticalDetailView, { showTitle: true, title: 'Before', data: this.left })
          .end()
          .start()
            .addClass('h500')
            .add('After')
            .tag(this.VerticalDetailView, { showTitle: true, title: 'After', data: this.right })
          .end()
        .end()
      .end()
      .endContext();

      // this.tag(this.DetailView, { data: this.left });
      // this.tag(this.DetailView, { data: this.right });
    }
  ]

});
