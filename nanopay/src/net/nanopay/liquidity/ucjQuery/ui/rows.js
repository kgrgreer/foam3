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

(function() {
  var rows = [['account','role'],['account','user'],['user','role']];

  for ( let i=0; i < rows.length; i++ ) {
    let left = rows[i][0];
    let right = rows[i][1];
    foam.CLASS({
      package: 'net.nanopay.liquidity.ucjQuery.ui',
      name: foam.String.capitalize(left) +
        foam.String.capitalize(right) + 'Row',
      tableColumns: [ left, right ],
      properties: [
        left, right,
        [ 'leftKey', left ],
        [ 'rightKey', right ],
        {
          name: 'id',
          class: 'String',
          getter: function () {
            return JSON.stringify([this[this.leftKey], this[this.rightKey]]);
          }
        }
      ]
    });
  }
})();