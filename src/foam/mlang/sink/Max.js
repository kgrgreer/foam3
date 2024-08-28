/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Max',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which remembers the maximum value put().',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, sub) {
        if ( ! this.hasOwnProperty('value') || foam.util.compare(this.value, this.arg1.f(obj)) < 0 ) {
          this.value = this.arg1.f(obj);
        }
      },
      swiftCode: `
        let arg1 = self.arg1!
        if !hasOwnProperty("value") || FOAM_utils.compare(value, arg1.f(obj)) < 0 {
          value = arg1.f(obj);
        }
      `,
      javaCode: `if ( getValue() == null || ((Comparable)getArg1().f(obj)).compareTo(getValue()) > 0 ) {
            setValue(getArg1().f(obj));
          }`
    }
  ]
});
