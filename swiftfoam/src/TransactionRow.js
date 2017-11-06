foam.CLASS({
  name: 'TransactionRow',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
    },
    {
      class: 'String',
      name: 'fullName',
      swiftView: 'foam.swift.ui.FOAMUILabel',
      swiftExpressionArgs: ['user$firstName', 'user$lastName'],
      swiftExpression: `
let f = (user$firstName as? String) ?? ""
let l = (user$lastName as? String) ?? ""
return f + " " + l
      `,
    },
    {
      class: 'String',
      name: 'amount',
      swiftView: 'foam.swift.ui.FOAMUILabel',
      swiftExpressionArgs: ['transaction$amount'],
      swiftExpression: `
guard let amount = transaction$amount as? Int else {
  return "ERROR " + String(describing: transaction$amount)
}
// TODO: Do the +/-
return "$" + String(amount)
      `,
    },
    {
      class: 'String',
      name: 'initials',
      swiftView: 'foam.swift.ui.FOAMUILabel',
      swiftExpressionArgs: ['user$firstName', 'user$lastName'],
      swiftExpression: `
let f = (user$firstName as? String) ?? ""
let l = (user$lastName as? String) ?? ""
return "\\(f.char(at: 0))\\(l.char(at: 0))"
      `,
    },
    {
      swiftType: 'UIColor',
      name: 'amountColor',
      swiftExpressionArgs: ['transaction$amount'],
      swiftExpression: `
guard let amount = transaction$amount as? Int else {
  return UIColor.red
}
// TODO: Do this properly.
if amount > 1000 {
  return UIColor.green
} else {
  return UIColor.red
}
      `,
    },
  ]
});
