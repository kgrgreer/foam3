/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.core',
    name: 'MacroModel',
    extends: 'foam.core.Model',

    documentation: 'Metaprogramming construct to create FOAM models from data',

    properties: [
        {
            class: 'Function',
            name: 'code'
        }
    ]
});

foam.LIB({
    name: 'foam',

    methods: [
        function DEF_MACRO(m) {
            m.class = m.class || 'foam.core.MacroModel';
            foam.CLASS(m);
        },
        function APPLY_MACRO(macroCls, data) {
            let macro = foam.lookup(macroCls).model_;

            // Future-proofing in case .model_ returns the raw object
            if ( ! macro.cls_ ) {
                // macro = foam.json.parse(macro);
                throw new Error('APPLY_MACRO expects model_ to be an FObject');
            }
            
            // Because macros are synchronous we can reaplce foam.CLASS for
            // convenience. Note that this means methods like foam.INTERFACE
            // will also use this implementation while the macro is applied.
            const realFoamDotClass = foam.CLASS;
            foam.CLASS = function (m) {
                m.genTransient = true;
                realFoamDotClass.call(foam, m);
            };

            if ( foam.Array.isInstance(data) ) {
                for ( const datum of data ) {
                    macro.code.call(macro, datum);
                }
            } else {
                macro.code.call(macro, data);
            }

            foam.CLASS = realFoamDotClass;
        }
    ]
});

foam.LIB({
    name: 'foam.Function',

    methods: [
        // This library function is specifically useful for macros which
        // generate 'expression' Property properties.
        function spoofArgNames(fn, newNames) {
            const oldToString = fn.toString;
            const argStr = newNames.join(', ');

            fn.toString = function () {
                return oldToString.call(this).replace(/^.*?\)/, `function (${argStr})`);
            };

            return fn;
        }
    ]
});