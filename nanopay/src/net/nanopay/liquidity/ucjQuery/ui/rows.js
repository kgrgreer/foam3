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
        {
          name: 'id',
          getter: function () {
            return JSON.stringify([this.left, this.right]);
          }
        }
      ]
    });
  }
})();