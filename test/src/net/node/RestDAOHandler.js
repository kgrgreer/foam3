/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('RestDAOHandler', function() {
  var port = 8888;
  var pathnamePrefix = '/dao';
  var baseURL = 'http://0.0.0.0:' + port + pathnamePrefix;
  var server;
  var serverPromise;
  var shutdownPromise = Promise.resolve(null);
  var serverDAO;
  var handler;
  var clientDAO;

  beforeEach(function() {
    serverDAO = foam.dao.ArrayDAO.create({ of: foam.core.FObject });
    server = foam.net.node.Server.create({
      port: port,
    });
    // Creation context provided by Server-as-context.
    handler = foam.net.node.RestDAOHandler.create({
      pathnamePrefix: pathnamePrefix,
      dao: serverDAO
    }, server);
    server.handler = handler;
    serverPromise = shutdownPromise.then(function() {
      return server.start();
    });
  });
  afterEach(function() {
    shutdownPromise = server.shutdown();
  });

  globalThis.genericDAOTestBattery(function(of) {
    return serverPromise.then(function() {
      return (clientDAO = foam.dao.RestDAO.create({
        of: of,
        baseURL: baseURL
      }));
    });
  });
});
