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
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'DateFrequency',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'startExpr'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'endExpr'
    },
    {
      class: 'Int',
      name: 'numLineGraphPoints',
      expression: function(numBarGraphPoints) {
        return numBarGraphPoints * 2;
      }
    },
    {
      class: 'Int',
      name: 'numBarGraphPoints'
    }
  ],

  values: [
    {
      name: 'HOURLY',
      label: 'Hourly',
      startExpr: { class: 'foam.glang.StartOfHour' },
      endExpr: { class: 'foam.glang.EndOfHour' },
      numBarGraphPoints: 24
    },
    {
      name: 'DAILY',
      label: 'Daily',
      startExpr: { class: 'foam.glang.StartOfDay' },
      endExpr: { class: 'foam.glang.EndOfDay' },
      numBarGraphPoints: 7
    },
    {
      name: 'WEEKLY',
      label: 'Weekly',
      startExpr: { class: 'foam.glang.StartOfWeek' },
      endExpr: { class: 'foam.glang.EndOfWeek' },
      numBarGraphPoints: 4
    },
    {
      name: 'MONTHLY',
      label: 'Monthly',
      startExpr: { class: 'foam.glang.StartOfMonth' },
      endExpr: { class: 'foam.glang.EndOfMonth' },
      numBarGraphPoints: 4
    },
    {
      name: 'QUARTERLY',
      label: 'Quarterly',
      startExpr: { class: 'foam.glang.StartOfQuarter' },
      endExpr: { class: 'foam.glang.EndOfQuarter' },
      numBarGraphPoints: 4
    },
    {
      name: 'ANNUALLY',
      label: 'Annually',
      startExpr: { class: 'foam.glang.StartOfYear' },
      endExpr: { class: 'foam.glang.EndOfYear' },
      numBarGraphPoints: 6
    },
  ]
});
