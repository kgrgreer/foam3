#!/usr/bin/env node

global.FOAM_FLAGS = {
  'node': true,
  'swift': true,
  'debug': true,
};

var execSync = require('child_process').execSync

var dir = __dirname;
var foam_root = dir + '/../../foam2';
var genDir = dir + '/stubs';

require(foam_root + '/src/foam.js');
execSync('rm -rf ' + genDir);

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    foam_root + '/src',
    dir + '/../nanopay/src',
  ],
  modelId: 'foam.swift.GenSwift',
  modelArgs: {
    models: [
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
      'net.nanopay.model.AccountInfo',
      'net.nanopay.model.AccountLimit',
      'net.nanopay.tx.model.Transaction',
      'net.nanopay.tx.model.TransactionPurpose',
    ],
    outdir: genDir,
  },
});
executor.execute();

