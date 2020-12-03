/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
    name: 'OTLoginToken',
    package: 'net.nanopay.auth.openid',

    documentation: "A one time use token to log a user in",

    properties: [
        {
            class: 'String',
            name: 'id'
        },
        {
            class: 'Reference',
            name: 'userId',
            of: 'foam.nanos.auth.User',
        },
        {
            class: 'Boolean',
            name: 'processed',
            value: false
        },
        {
            class: 'Long',
            name: 'expiry',
            documentation: 'The token expiry date'
        },
    ]
})
