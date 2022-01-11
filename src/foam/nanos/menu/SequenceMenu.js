/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
        }
    ],

    methods: [
        function launch(X, menu) {
            // Rebase sequence onto new context first
            const sequence = this.Sequence.create({}, X);
            for ( let fluentSpec of this.sequence ) {
                fluentSpec.apply(sequence);
            }
            sequence.execute();
        },
    ],
});