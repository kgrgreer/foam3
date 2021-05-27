/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
    package: 'foam.swift',
    name: 'SWIFTOutputterImpl',

    implements: [
        'foam.swift.SWIFTOutputter'
    ],

    javaImports: [
        'foam.core.*',
        'java.util.List',
        'java.util.Date',
    ],

    properties: [
        {
            class: 'Class',
            name: 'of',
            required: true
        },
    ],

    methods: [
        {
            name: 'outputValue',
            code: function(message) {
                var SBF = '';
                //MTn96 and MTn92 lacks a fieldtag at the last position, so translating leads to crash
                for (var i = 1; i < message.length + 1; i++)
                {
                    //note, the i is NOT correct for the below command, modification required
                    var field = foam.lookup("net.nanopay.swift.fields.FieldTag" + i).create();
                    SBF += field.toSBF(message);
                }
                return SBF;
            },
        },
    ]
});