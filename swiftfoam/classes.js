global.FOAM_FLAGS.src = __dirname + '/../nanopay/src/';
require(__dirname + '/../nanopay/src/net/nanopay/files.js');

var classes = [
  'foam.box.Box',
  'foam.box.BoxRegistry',
  'foam.box.BoxService',
  'foam.box.ClientBoxRegistry',
  'foam.box.Context',
  'foam.box.HTTPBox',
  'foam.box.Message',
  'foam.box.RPCMessage',
  'foam.box.RemoteException',
  'foam.box.ReplyBox',
  'foam.dao.ArraySink',
  'foam.dao.ClientDAO',
  'foam.mlang.Constant',
  'foam.mlang.Expr',
  'foam.mlang.predicate.Eq',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.EnabledAware',
  'foam.nanos.auth.Language',
  'foam.nanos.auth.LastModifiedAware',
  'foam.nanos.auth.LastModifiedByAware',
  'foam.nanos.auth.User',
  'foam.swift.box.RPCReturnBox',
  'foam.swift.parse.StringPStream',
  'foam.swift.parse.json.output.HTTPBoxOutputter',
  'foam.u2.Visibility',
  'net.nanopay.model.Account',
  'net.nanopay.model.AccountLimit',
  'net.nanopay.model.Phone',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.model.TransactionLimit',
  'net.nanopay.tx.model.TransactionPurpose',
];

module.exports = {
  classes: classes,
}
