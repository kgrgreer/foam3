/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.ndiff',
    name: 'NDiff',
    documentation: `Tracks changes to nSpecs. Used for debugging`,

    ids: ['nSpecName', 'objectId'],
    properties: [
    {
        class: 'String',
        name: 'nSpecName'
    },
    {
        class: 'String',
        name: 'objectId'
    },
    {
        class: 'Boolean',
        name: 'delta',
        documentation: `
        Set to true if a difference was detected.
        `
    },
    {
        class: 'FObjectProperty',
        name: 'initialFObject',
        documentation: `
        The object as it was loaded from the repo journals (".0 file")
        `
    },
    {
        class: 'FObjectProperty',
        name: 'runtimeFObject',
        documentation: `
        The object as it was loaded from the runtime journals
        `
    }
    ]

});
