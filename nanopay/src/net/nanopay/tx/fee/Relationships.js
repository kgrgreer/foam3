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

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.fee.TransactionFeeRule',
  targetModel: 'net.nanopay.tx.fee.Fee',
  forwardName: 'fees',
  inverseName: 'feeRule',
  cardinality: '1:*',
  sourceDAOKey: 'ruleDAO',
  targetProperty: {
    view: function(_, X) {
      var E = foam.mlang.Expressions.create();
      return foam.u2.view.RichChoiceView.create({
        search: true,
        sections: [
          {
            dao: X.ruleDAO.where(E.INSTANCE_OF(net.nanopay.tx.fee.TransactionFeeRule))
          }
        ],
      });
    }
  }
});
