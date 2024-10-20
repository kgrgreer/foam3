/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

/**
 * Event listener utilities.
 */
foam.LIB({
  name: 'foam.events',

  methods: [
    function oneTime(listener) {
      /** Create a "one-time" listener which unsubscribes itself when called. **/
      return function(subscription) {
        subscription.detach();
        listener.apply(this, Array.from(arguments));
      };
    },

    function consoleLog(listener) {
      /** Log all listener invocations to console. **/
      return function() {
        var args = Array.from(arguments);
        console.log(args);
        listener && listener.apply(this, args);
      };
    },
    function discardStale(listener) {
      // Useful for making async calls which are sensative to getting data from the latest call
      // Any listener wrapped in this method will discard old async results if a newer one is in flight
      let ret =  function() {
        ret.callId = {}.$UID;
        const localId = ret.callId;
        return listener.call(this, ...arguments).then(v => {
          if ( localId == ret.callId ) {
            return v;
          }
          throw new Error('stale response');
        });
      };
      return ret;
    }
  ]
});
