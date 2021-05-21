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
    package: 'net.nanopay.account.ui.addAccountModal.liquidityRule',
    name: 'LiquidityMode',

    documentation: `
        Liquidity threshold rules for when creating an account in Liquid
    `,

    values: [
        { name: "NONE", label: 'Select a rule' },
        { name: "NOTIFY", label: 'Send notifications' },
        { name: "NOTIFY_AND_AUTO", label: 'Send notifications & automatic transactions' },
    ]
});
