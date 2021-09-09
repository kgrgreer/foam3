/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.notification.email;

import com.google.common.base.Optional;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.nanos.auth.Group;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailTemplate;
import foam.nanos.notification.email.EmailTemplateSourceEnum;
import foam.nanos.pm.PM;
import foam.nanos.pm.PMInfo;
import foam.util.SafetyUtil;
import org.jtwig.resource.loader.ResourceLoader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

import static foam.mlang.MLang.*;

public class DAOResourceLoader
  extends    ContextAwareSupport
  implements ResourceLoader
{
  protected String groupId_;
  protected String locale_;
  protected String spid_;

  public static EmailTemplate findTemplate(X x, String name, String groupId, String locale, String spid, Map templateArgs) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");
    EmailTemplate emailTemplate = null;

    do {
      boolean group_  = ! SafetyUtil.isEmpty(groupId);
      boolean spid_   = ! SafetyUtil.isEmpty(spid);

      if ( group_ && spid_ )
        emailTemplate = findTemplateHelper(x, name, groupId, locale, spid, templateArgs);

      if ( emailTemplate == null && group_ )
        emailTemplate = findTemplateHelper(x, name, groupId, locale, "", templateArgs);

      if ( emailTemplate == null && spid_ )
        emailTemplate = findTemplateHelper(x, name, groupId, "en", spid, templateArgs);

      if ( emailTemplate == null && group_ )
        emailTemplate = findTemplateHelper(x, name, groupId, "en",   "", templateArgs);

      if ( emailTemplate == null && spid_ )
        emailTemplate = findTemplateHelper(x, name,"", "en", spid, templateArgs);

      if ( emailTemplate == null )
        findTemplateHelper(x, name, "", "en", "", templateArgs);

      if ( emailTemplate != null ) return emailTemplate;

      // exit condition, no emails even with wildcard group so return null
      if ( "*".equals(groupId) ) return null;

      Group group = (Group) groupDAO.find(groupId);
      groupId = ( group != null && ! SafetyUtil.isEmpty(group.getParent()) ) ? group.getParent() : "*";
    } while ( ! SafetyUtil.isEmpty(groupId) );

    return null;
  }

  public static EmailTemplate findTemplate(X x, String name, String groupId, String locale, String spid) {
    Map templateArgs = new HashMap<>();
    return findTemplate(x, name, groupId, locale, spid, templateArgs);
  }

  public static EmailTemplate findTemplate(X x, String name) {
    User user = ((Subject) x.get("subject")).getRealUser();
    var groupId = user.findGroup(x).getId();
    String locale = user.getLanguage().getCode();
    String spid = user.getSpid();

    return findTemplate(x, name, groupId, locale, spid);
  }

  public static EmailTemplate findTemplateHelper(X x, String name, String groupId, String locale, String spid, Map templateArgs) {
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");
    EmailTemplate emailTemplate_ = (EmailTemplate) emailTemplateDAO
      .find(
        AND(
          EQ(EmailTemplate.NAME, name),
          EQ(EmailTemplate.GROUP, SafetyUtil.isEmpty(groupId) ? "*" : groupId),
          EQ(EmailTemplate.SPID, spid),
          EQ(EmailTemplate.LOCALE, locale)
        ));

    if ( ! name.equals("header") && emailTemplate_ != null ) {
      EmailTemplate clonedTemplate = (EmailTemplate) emailTemplate_.fclone();
      String sourceType = (String) templateArgs.get("templateSourceType");
      String source = (String) templateArgs.get("templateSource");

      if ( ! SafetyUtil.isEmpty(sourceType) )
        clonedTemplate.setSourceType(sourceType);
      else
        clonedTemplate.setSourceType(EmailTemplateSourceEnum.UNDEFINED_SOURCE.getLabel());

      if ( ! SafetyUtil.isEmpty(source) )
        clonedTemplate.setSourceClass(source);
      else
        clonedTemplate.setSourceClass(EmailTemplateSourceEnum.UNDEFINED_SOURCE.getLabel());

      PM pm = PM.create(x, source, name);
      pm.log(x);

      emailTemplateDAO.put(clonedTemplate);
    }

    return emailTemplate_;
  }

  public DAOResourceLoader(X x, String groupId, String locale, String spid) {
    setX(x);
    this.groupId_ = groupId;
    this.locale_  = locale;
    this.spid_ = spid;
  }

  @Override
  public Optional<Charset> getCharset(String s) {
    return Optional.absent();
  }

  @Override
  public InputStream load(String s) {
    EmailTemplate template = DAOResourceLoader.findTemplate(getX(), s, this.groupId_, this.locale_, this.spid_);
    return template == null ? null : new ByteArrayInputStream(template.getBodyAsByteArray());
  }

  @Override
  public boolean exists(String s) {
    return load(s) != null;
  }

  @Override
  public Optional<URL> toUrl(String s) {
    return Optional.absent();
  }
}
