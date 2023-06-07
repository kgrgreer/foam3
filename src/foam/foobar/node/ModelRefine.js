/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.foobar.node',
    name: 'NodeRequires',

    issues: [
        'relative requires will not be relative to FOAM model location'
    ],

    properties: [
        {
            name: 'name',
            factory: function () {
                return this.path.split('/').pop();
            }
        },
        'path'
    ],

    methods: [
        function installInProto(proto) {
            const name = this.name;
            const path = this.path;
            const registerName = `nodeRequires:${this.name}`;
            Object.defineProperty(proto, name, {
                get: function nodeRequiresGetter() {
                    if ( ! this.hasOwnPrivate_(registerName) ) {
                        this.setPrivate_(registerName, require(path));
                    }

                    return this.getPrivate_(registerName);
                },
                set: function (cls) {
                    throw new Error('invalid override on nodeRequires property');
                }
            });
        }
    ]
});

foam.CLASS({
    package: 'foam.foobar.node',
    name: 'ModelRefine',
    refines: 'foam.core.Model',

    properties: [
        {
            class: 'AxiomArray',
            of: 'foam.foobar.node.NodeRequires',
            name: 'nodeRequires',
            adaptArrayElement: function (o) {
                if ( typeof o === 'string' ) {
                    let a = o.split(' as ');
                    let path = a[0];
                    let r = foam.foobar.node.NodeRequires.create({ path }, this);
                    if ( a[1] ) r.name = a[1];
                    return r;
                }
                return foam.foobar.node.NodeRequires.create(o, this);
            }
        }
    ]
});
