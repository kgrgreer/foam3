/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'MementoUtils',

  imports: ['memento'],

  exports: ['currentMemento_ as memento'],

  properties: ['currentMemento_'],

  methods: [
    function initMemento() {
      if ( this.memento ) {
        if ( ! this.memento.tail )
          this.memento.tail = foam.nanos.controller.Memento.create();
        this.currentMemento_ = this.memento.tail;
      } else {
        this.currentMemento_ = foam.nanos.controller.Memento.create();
      }
    }
  ]
});
