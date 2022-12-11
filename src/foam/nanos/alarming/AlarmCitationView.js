/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^created {
      font-size: 1.1rem;
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
      name: 'name',
      expression: function(data$name) {
        return data$name;
      }
    },
    {
      name: 'note',
      expression: function(data$note) {
        return data$note;
      }
    }
  ],

  methods: [
    function render() {
      var self = this;

      this.SUPER();

      this.
        addClass(this.myClass()).
        start().
        start().addClass(this.myClass('name')).
          add(this.name$).
        end().
        start().addClasses(['p', this.myClass('note')]).
          add(this.note$).
        end().
        callIf(this.isActive, function() {
          this.add(this.stop);
        }).
        callIfElse(this.isActive, function() {
          this.add(this.start);
        }).
        end();
    }
  ]
});
