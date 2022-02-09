/**
@license
Copyright 2022 The FOAM Authors. All Rights Reserved.
http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RadioEnumView',
  extends: 'foam.u2.view.RadioView',

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      name: 'choices',
      expression: function(of) {
        return of ? of.VALUES.map(v => [v, v.label]) : [];
      }
    }
  ],

  methods: [
    // This method will be called where the view is associated with and provide
    // the Property Object to view the Property value so we don't need to
    // explicitly set "choices" in the view.
    function fromProperty(p) {
      this.SUPER(p);
      if ( ! this.of ) this.of = p.of;
    }
  ]
});
