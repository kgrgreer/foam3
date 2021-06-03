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
            name: 'outputFObject',
            code: function(obj) {
                var SBF = this.outputHeader();
                obj.cls_.getAxiomsByClass(net.nanopay.swift.fields.FieldTagRegexValidated).forEach(p => SBF += p.toSBF(obj));
                return SBF;
            },
        },
        {
            name: 'outputHeader',
            code: function(obj)
            {
                return '{' + obj.generateBasicHeader() + '}{' + obj.generateApplicationHeader() + '}{' + obj.generateUserHeader() + '}';
            }
        }
    ]
});