/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.parse',
    name: 'FScriptTest',
    extends: 'foam.nanos.test.Test',

    methods: [
        {
            name: 'runTest',
            javaCode: `
            var check1 = "select user if name equals Mike or Kevin";
            var check2 = "select user if name equals Mike and age greater than 19";
            var check3 = "select user if name not equals Mike";
            var check4 = "select user if age less than 19";
            var check5 = "";
            var check6 = "";
            var check7 = "";
            var check8 = "";
            foam.parse.FScript(check1);
            foam.parse.FScript(check2);
            foam.parse.FScript(check3);
            foam.parse.FScript(check4);
            foam.parse.FScript(check5);
            foam.parse.FScript(check6);
            foam.parse.FScript(check7);
            foam.parse.FScript(check8);
            `
        }
    ]
});