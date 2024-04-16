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
  package: 'foam.nanos.so',
  name: 'MessageTask',
  extends: 'foam.nanos.so.SystemOutageTask',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.i18n.Locale',
    'foam.i18n.TranslationService',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'messageKeyText'
    },
    {
      class: 'String',
      name: 'replacementText',
    },
    {
      class: 'String',
      name: 'savedText',
      visibility: 'RO'
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
      args: 'X x, String source, String replacement',
      javaCode: `
        if ( x == null || SafetyUtil.isEmpty(source) ) return;
        if ( SafetyUtil.isEmpty(replacement) ) return;

        var ts = (TranslationService) x.get("translationService");
        if ( ts == null ) return;

        var locale = (String) x.get("locale.language");
        if ( SafetyUtil.isEmpty(locale) ) locale = "en";

        setSavedText(ts.getTranslation(locale, source, source));
        setTranslation(x, locale, source, replacement);
      `
    },
    {
      name: 'activate',
      args: 'X x',
      javaCode: `
        updateTranslation(x, getMessageKeyText(), getReplacementText());
      `
    },
    {
      name: 'deactivate',
      args: 'X x',
      javaCode: `
        updateTranslation(x, getMessageKeyText(), getSavedText());
        clearProperty("replacementText");
      `
    },
    {
      name: 'setTranslation',
      args: 'X x, String locale, String source, String replacement',
      javaCode: `
        if ( SafetyUtil.isEmpty(source) ||
             SafetyUtil.isEmpty(replacement) )
          return;

        if ( SafetyUtil.isEmpty(locale) ) {
          locale = (String) x.get("locale.language");
          if ( foam.util.SafetyUtil.isEmpty(locale) ) {
            locale = "en";
          }
        }

        DAO localeDAO = (DAO) getX().get("localeDAO");

        // locale - determines locale type (en, fr, es …etc)
        // variant - Locale variation (CA for en-CA, CA for fr-CA, AT for de_AT …etc)
        String variant     = "";
        Locale localeEntry = null;

        // note: 'locale' passed to the function may be in locale format or in local variant format
        // so we need to check which format is used and parse it if necessary.
        boolean hasVariant = locale.contains("-");
        if ( hasVariant ) {
          variant = locale.substring(3).toUpperCase();
          locale  = locale.substring(0,2).toLowerCase();

          // search for locale and variant
          localeEntry = (Locale) localeDAO.find(
            AND(
              EQ(Locale.SOURCE,  source),
              EQ(Locale.LOCALE,  locale),
              EQ(Locale.VARIANT, variant)
            )
          );
        } else {
          locale = locale.toLowerCase();
        }

        // search for locale with no variant
        if ( localeEntry == null ) {
          localeEntry = (Locale) localeDAO.find(
            AND(
              EQ(Locale.SOURCE,  source),
              EQ(Locale.LOCALE,  locale),
              EQ(Locale.VARIANT, "")
            )
          );
        }

        if ( localeEntry != null ) {
          localeEntry = (Locale) localeEntry.fclone();
          localeEntry.setTarget(replacement);
          localeEntry.setNote("MessageText replacement");
          localeDAO.put(localeEntry);
        } else {
          Loggers.logger(x, this).warning("Translation not found", source);
        }
      `
    }
  ]
});
