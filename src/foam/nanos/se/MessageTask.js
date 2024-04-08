/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.nanos.se',
  name: 'MessageTask',
  implements: 'foam.nanos.se.SystemEventTask',

  javaImports: [
    'foam.core.X',
    'foam.i18n.TranslationService',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'messageKeyText'
    },
    {
      class: 'String',
      name: 'replacementText'
    },
    {
      class: 'Enum',
      of: 'foam.log.LogLevel',
      name: 'severity',
      value: 'WARN'
    },
    {
      class: 'StringArray',
      name: 'themes',
      view: {
        class: 'foam.u2.view.ReferenceArrayView',
        daoKey: 'themeDAO',
        allowDuplicates: false
      }
    }
  ],

  methods: [
    {
      name: 'updateTranslation',
      args: 'X x',
      javaType: 'String',
      javaCode: `
        var msg = getMessageKeyText();
        if ( x == null || SafetyUtil.isEmpty(msg) ) return msg;

        var ts = (TranslationService) x.get("translationService");
        if ( ts == null ) return msg;

        var locale = (String) x.get("locale.language");
        if ( SafetyUtil.isEmpty(locale) ) locale = "en";

        return ts.getTranslation(locale, msg, msg);
      `
    },
    {
      name: 'activate',
      args: 'X x',
      javaCode: `
        this.setReplacementText(updateTranslation(x));
      `
    },
    {
      name: 'deactivate',
      args: 'X x',
      javaCode: `
        this.clearProperty("replacementText");
      `
    }
  ]
});
