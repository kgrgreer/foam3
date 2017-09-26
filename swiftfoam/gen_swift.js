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
      'foam.swift.parse.json.output.HTTPBoxOutputter',
      'foam.u2.Visibility',
      'foam.swift.parse.StringPStream',
      'foam.box.Context',
      'foam.box.Box',
      'foam.box.HTTPBox',
      'foam.box.BoxService',
      'foam.box.BoxRegistry',
      'foam.box.ReplyBox',
      'foam.box.ClientBoxRegistry',
      'foam.swift.box.RPCReturnBox',
      'foam.box.RPCMessage',
      'foam.box.Message',
      'foam.dao.ArraySink',
      'foam.dao.ClientDAO',
      'foam.box.RemoteException',

      'net.nanopay.tx.model.Transaction',
      'net.nanopay.tx.model.TransactionPurpose',
    ],
    outdir: genDir,
  },
});
executor.execute();

