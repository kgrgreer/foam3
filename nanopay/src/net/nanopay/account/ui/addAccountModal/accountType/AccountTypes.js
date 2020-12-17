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

foam.ENUM({
    package: 'net.nanopay.account.ui.addAccountModal.accountType',
    name: 'AccountTypes',

    documentation: `
        The account types available to be created with Liquid
    `,

    values: [
        { name: 'SHADOW_ACCOUNT', label: 'Shadow account' },
        { name: 'AGGREGATE_ACCOUNT', label: 'Aggregate account' },
        { name: 'VIRTUAL_ACCOUNT', label: 'Virtual account' },
    ]
});
