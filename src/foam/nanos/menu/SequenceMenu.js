/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'SequenceMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [
    'foam.util.async.Sequence'
  ],

  properties: [
    {
      class: 'FObjectArray',
      // of: 'foam.util.FluentSpec',
      of: 'foam.core.FObject',
      name: 'sequence'
    },
    {
      class: 'StringArray',
      name: 'parentMethod'
    }
  ],

  methods: [
    function launch(X, menu) {
      // Rebase sequence onto new context first
      let sequence = this.Sequence.create({}, X);
      if ( this.parentMethod.length > 0 ) {
        sequence = X[this.parentMethod[0]]
          [this.parentMethod[1]](X);
      }
      for (let fluentSpec of this.sequence) {
        fluentSpec.apply(sequence);
      }

      // Add a blank view to the empty stack because empty stack causes the
      // wizard popup created by the sequence menu to persist and not showing
      // the view on subsequent stack.push().
      //
      // NOTE: it is by design for the first element of a stack to never be
      // removed to prevent client from jumping back beyond its initial view.
      if ( X.stack.pos < 0 )
        X.stack.push({ class: 'foam.u2.borders.NullBorder' });

      return sequence.execute();
    }
  ]
});
