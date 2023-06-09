/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^created {
      color: $grey500;
    }
    ^description {
      color: $black;
      width: 100%;
    }
  `,

  properties: [
    'of',
    {
      name: 'created',
      expression: function(data$created) {
        return data$created.toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium' });
      }
    },
    {
      name: 'description',
      expression: function(data$body) {
        return data$body;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start().addClass(['p-legal-light', this.myClass('created')])
            .add(this.created$)
          .end()
          .start().addClass('p', this.myClass('description'))
            .add(this.description$)
          .end()
        .end();
    }
  ]
});
