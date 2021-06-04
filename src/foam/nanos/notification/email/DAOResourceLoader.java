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
import foam.util.SafetyUtil;
import org.jtwig.resource.loader.ResourceLoader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.List;

import static foam.mlang.MLang.*;

public class DAOResourceLoader
  extends    ContextAwareSupport
  implements ResourceLoader
{
  protected String groupId_;
  protected String locale_;
  protected String spid_;

  public static EmailTemplate findTemplate(X x, String name, String groupId, String locale, String spid) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");
    EmailTemplate emailTemplate = null;

    do {
      boolean group_  = ! SafetyUtil.isEmpty(groupId);
      boolean spid_   = ! SafetyUtil.isEmpty(spid);

      if ( group_ && spid_ )
        emailTemplate = findTemplateHelper(x, name, groupId, locale, spid);

      if ( emailTemplate == null && group_)
        emailTemplate = findTemplateHelper(x, name, groupId, locale, "");

      if ( emailTemplate == null && spid_ )
        emailTemplate = findTemplateHelper(x, name, groupId, "en", spid);

      if ( emailTemplate == null && group_ && spid_ )
        emailTemplate = findTemplateHelper(x, name, groupId,"en", spid);

      if ( emailTemplate == null && group_ )
        emailTemplate = findTemplateHelper(x, name, groupId, "en",   "");

      if ( emailTemplate == null && spid_ )
        emailTemplate = findTemplateHelper(x, name,"", "en", spid);

      if ( emailTemplate == null )
        findTemplateHelper(x, name, "", "en", "");

      if ( emailTemplate != null ) return emailTemplate;

      // exit condition, no emails even with wildcard group so return null
      if ( "*".equals(groupId) ) return null;

      Group group = (Group) groupDAO.find(groupId);
      groupId = ( group != null && ! SafetyUtil.isEmpty(group.getParent()) ) ? group.getParent() : "*";
    } while ( ! SafetyUtil.isEmpty(groupId) );

    return null;
  }

  public static EmailTemplate findTemplate(X x, String name) {
    User user = ((Subject) x.get("subject")).getRealUser();
    var groupId = ((Group) x.get("group")).getId();
    String locale = user.getLanguage().getCode();
    String spid = user.getSpid();

    return findTemplate(x, name, groupId, locale, spid);
  }

  public static EmailTemplate findTemplateHelper(X x, String name, String groupId, String locale, String spid) {
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");
    EmailTemplate emailTemplate_ = (EmailTemplate) emailTemplateDAO
      .find(
        AND(
          EQ(EmailTemplate.NAME, name),
          EQ(EmailTemplate.GROUP, SafetyUtil.isEmpty(groupId) ? "*" : groupId),
          EQ(EmailTemplate.SPID, spid),
          EQ(EmailTemplate.LOCALE, locale)
        ));

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
