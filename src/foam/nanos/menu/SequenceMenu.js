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
    function select(X, menu) {
      /** Called when a menu is selected. **/
      return X.pushMenu(menu.id, true);
    },
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
      
      sequence.execute();
      return null;
    }
  ]
});
