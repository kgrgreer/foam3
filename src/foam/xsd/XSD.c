typedef struct {
  multitype_union_t package;
  multitype_union_t xsd;
  multitype_union_t xsdPath;
  multitype_union_t simpleTypes;
  multitype_union_t xmlns;
  multitype_union_t enums;
} foam_xsd_XSDCompiler_t;

void escape(multitype_union_t str) {

      return str_replace(/\\/g, '\\\\')
    
}
void addJavaAssertValue(multitype_union_t m) {

      if ( ! m->properties ) m->properties = [];

      if ( m->extends === 'foam->core->String' ) {
        m->properties_push({
          name: 'javaAssertValue',
          factory: function () {
            var toReturn = '';

            if ( this->minLength || this->minLength === 0 ) {
              toReturn +=
  `if ( val_length() < ` + this->minLength + ` ) {
    throw new IllegalArgumentException("${this->name}");
  }\n`;
            }

            if ( this->maxLength || this->maxLength === 0 ) {
              toReturn +=
  `if ( val_length() > ` + this->maxLength + ` ) {
    throw new IllegalArgumentException("${this->name}");
  }\n`;
            }

            if ( this->pattern ) {
              toReturn +=`foam->util->SafetyUtil_assertPattern(val, "${this->pattern}", "${this->name}");\n`;
            }
            return toReturn;
          }
        });
      } else if ( m->extends === 'foam->core->Float' ) {
        m->properties_push({
          name: 'javaAssertValue',
          factory: function () {
            var toReturn = '';

            if ( this->minInclusive || this->minInclusive === 0 ) {
              toReturn +=
  `if ( val < ` + this->minInclusive + ` ) {
    throw new IllegalArgumentException("${this->name}");
  }\n`;
            }

            if ( this->minExclusive || this->minExclusive === 0 ) {
              toReturn +=
  `if ( val <= ` + this->minInclusive + ` ) {
    throw new IllegalArgumentException("${this->name}");
  }\n`;
            }

            if ( this->maxInclusive || this->maxInclusive === 0 ) {
              toReturn +=
  `if ( val > ` + this->maxInclusive + ` ) {
    throw new IllegalArgumentException("${this->name}");
  }\n`;
            }

            if ( this->maxExclusive || this->maxExclusive === 0 ) {
              toReturn +=
  `if ( val >= ` + this->maxExclusive + ` ) {
    throw new IllegalArgumentException("${this->name}");
  }\n`;
            }

            if ( this->totalDigits || this->fractionDigits ) {
              toReturn +=
  `String str = Double_toString(val);
  int length = str_length();
  boolean hasDecimal = str_contains("->");\n`

              if ( this->totalDigits ) {
                toReturn +=
  `if ( hasDecimal ) length -= 1;
  if ( length > ` + this->totalDigits + ` ) {
    throw new IllegalArgumentException("${this->name}");
  }\n`
              }

              if ( this->fractionDigits ) {
                toReturn +=
  `if ( hasDecimal ) {
    String decimals = str_split("\\\\->")[1];
    if ( decimals_length() > ` + this->fractionDigits + ` ) {
      throw new IllegalArgumentException("${this->name}");
    }
  }\n`
              }
            }

            return toReturn;
          }
        });
      }
    
}
void addAssertValue(multitype_union_t m) {

      if ( ! m->properties ) m->properties = [];

      if ( m->extends === 'foam->core->String' ) {
        m->properties_push({
          name: 'assertValue',
          value: function (value, prop) {
            if ( ( prop->minLength || prop->minLength === 0 ) && strlen(value) < prop->minLength )
              throw new Error(prop->name);
            if ( ( prop->maxLength || prop->maxLength === 0 ) && strlen(value) > prop->maxLength )
              throw new Error(prop->name);
            if ( prop->pattern && ! new RegExp(prop->pattern, 'g')_test(value) )
              throw new Error(prop->name);
          }
        });
      } else if ( m->extends === 'foam->core->Float' ) {
        m->properties_push({
          name: 'assertValue',
          value: function (value, prop) {
            if ( ( prop->minInclusive || prop->minInclusive === 0 ) && value < prop->minInclusive )
              throw new Error(prop->name);
            if ( ( prop->minExclusive || prop->minExclusive === 0 ) && value <= prop->minExclusive )
              throw new Error(prop->name);
            if ( ( prop->maxInclusive || prop->maxInclusive === 0 ) && value > prop->maxInclusive )
              throw new Error(prop->name);
            if ( ( prop->maxExclusive || prop->maxExclusive === 0 ) && value >= prop->maxExclusive )
              throw new Error(prop->name);

            if ( prop->totalDigits || prop->fractionDigits ) {
              var str = value + '';
              var length = strlen(str);
              var hasDecimal = str_indexOf('->') !== -1;

              if ( prop->totalDigits ) {
                if ( hasDecimal ) length -= 1;
                if ( length > prop->totalDigits )
                  throw new Error(prop->name);
              }

              if ( prop->fractionDigits && hasDecimal ) {
                var decimals = str_split('->')[1];
                if ( strlen(decimals) > prop->fractionDigits )
                  throw new Error(prop->name);
              }
            }
          }
        });
      }
    
}
void processEnum(multitype_union_t m, multitype_union_t doc) {

      m->type   = 'enum';
      m->values = [];

      // add the enum values
      for ( var key in doc ) {
        var child = doc[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1) continue;
        var value = child_getAttribute('value');
        var duplicate = false;
        for ( var idx in m->values ) {
          var val = m->values[idx];
          if ( val->name_toUpperCase() === value_toUpperCase() ) {
            // console_info("processEnum,duplicate",value);
            duplicate = true;
            continue;
          }
        }
        if ( duplicate ) continue;
        var label = value;
        if ( Number_isInteger(value[0] - '0') ) value = '_' + value;
        m->values_push({
          name: value,
          label: label
        });
      }
      this->enums_set(m->name, m);
    
}
void processRestriction(multitype_union_t m, multitype_union_t doc) {

      // fetch the child nodes
      var children = doc->childNodes;
      if ( ! m->extends ) m->extends = this->TYPES[doc_getAttribute('base')];

      // get the properties for the simple type
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;

        // handle enum
        if ( child->localName === 'enumeration' ) {
          delete m->extends;
          this->processEnum (m, children);
          break;
        }

        // add properties array if not already present
        if ( ! m->properties ) m->properties = [];

        // get the value
        var value = child_getAttribute('value');

        // check if value is numeric or not
        var isNumeric = /^\d+$/_test(value);

        // if pattern, prefix carrot and append dollar sign
        // because for xsd schema these are implicit
        if ( child->localName === 'pattern' ) {
          value = '^' + value + '$';
        }

        // escape regex pattern
        if ( child->localName === 'pattern' ) {
          value = this_escape(value);
        }

        // add the property
        m->properties_push({
          class: isNumeric ? 'Int' : 'String',
          name: child->localName,
          value: isNumeric ? parseInt(value, 10) : value
        });
      }

      // add value assertions for JavaScript
      this_addAssertValue(m);

      // add value assertions for Java
      this_addJavaAssertValue(m);
    
}
void processUnion(multitype_union_t m, multitype_union_t doc) {

      // split memberTypes and
      var keys = new Set();
      var memberTypes = doc_getAttribute('memberTypes')_split(' ');
      for ( var idx in memberTypes ) {
        var mt = memberTypes[idx];
        var st = this->simpleTypes[mt];
        if ( st ) {
          // all the types to be joined need to be the same type
          this->simpleTypes[m->name] = st;
          if ( st === 'foam->core->Enum' ) {
            var e = this->enums_get(mt);
            m->values = m->values || [];
            m->values = m->values_concat(e->values);
            // FIXME: just add the first-> The concatenation
            // cannot have duplicates else the Enum class creation
            // will fail - silently->
            break;
          }
        } else {
          console_warn("processUnion,not found", mt);
        }
      }

      if ( m->values ) {
        delete m->extends;
        m->type = 'enum';
        this->enums_set(m->name, m);
      }
    
}
void processSimpleType(multitype_union_t m, multitype_union_t doc) {

      var children = doc->childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;
        switch ( child->localName ) {
          case 'restriction':
            // process restriction tags
            this_processRestriction(m, child);
            break;
          case 'union':
            this_processUnion(m, child);
            break;
        }
      }
    
}
void checkForEnum(multitype_union_t doc) {

      for ( var key in doc->childNodes ) {
        var child = doc->childNodes[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;
        // check for enumeration
        if ( child->localName === 'enumeration' ) {
          return true;
        }
      }
      return false;
    
}
void getPropType(multitype_union_t baseType) {

      if ( this->simpleTypes[baseType] ) return this->package + '->' + baseType;
      return this->TYPES[baseType] || 'FObjectProperty';
    
}
void processChoice(multitype_union_t m, multitype_union_t doc) {

      m->type = 'choice';
      // add properties if it doesn't exist
      if ( ! m->properties ) m->properties = [];
      var children = doc->childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;
        var name = child_getAttribute('name');
        var type = child_getAttribute('type');
        var classType = this_getPropType(type);

        let property = {
          class: classType,
          name: this_toPropertyName(name),
          shortName: name
        };

        if ( classType === 'FObjectProperty' ) {
          property->of = this->package + '->' + type;
        }

        // check if enum
        if ( this->simpleTypes[child_getAttribute('type')] === 'foam->core->Enum' ) {
          property->class = 'foam->core->Enum';
          property->of = this->package + '->' + child_getAttribute('type');
        }

        property->preSet = eval(`(function (_, value) { this->instance_ = {}; return value; })`)
        m->properties_push(property);
      }
    
}
void processSimpleContentExtension(multitype_union_t m, multitype_union_t doc) {

      // modify extends property
      var children = doc->childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;
        // add properties array if not already present
        if ( ! m->properties ) m->properties = [];
        // create property

        let name = child_getAttribute('name');
        let property = {
          class: this_getPropType(child_getAttribute('type')),
          name: this_toPropertyName(name),
          shortName: name
        };

        if ( child->localName === 'attribute' ) {
          property->xmlAttribute = true;
        }

        // add "of" property if class is FObjectProperty
        if ( property->class === 'FObjectProperty' ) {
          property->of = this->package + '->' + child_getAttribute('type');
        }

        // add property to array
        m->properties_push(property);
      }

      let valueProp = {
        class: this_getPropType(doc_getAttribute('base')),
        name: 'text',
        xmlTextNode: true
      };

      if ( valueProp->class === 'FObjectProperty' ) {
        valueProp->of = this->package + '->' + doc_getAttribute('base');
      }

      m->properties_push(valueProp);
    
}
void processSimpleContent(multitype_union_t m, multitype_union_t doc) {

      var children = doc->childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;
        switch ( child->localName ) {
          case 'extension':
            this->processSimpleContentExtension (m, child);
            break;
        }
      }
    
}
void createProperty(multitype_union_t modelName, multitype_union_t type, multitype_union_t name) {

      return {
        class: this_getPropType(type),
        name: this_toPropertyName(name),
        shortName: name
      };
    
}
void processSequenceElement(multitype_union_t m, multitype_union_t doc) {

      // add properties array if not already present
      if ( ! m->properties ) m->properties = [];

      let maxOccurs = doc_getAttribute('maxOccurs') || 1;
      // convert to int if not set to "unbounded"
      if ( maxOccurs !== 'unbounded') maxOccurs = parseInt(maxOccurs, 10);
      let minOccurs = parseInt(doc_getAttribute('minOccurs'), 10) || 1;

      // group ref
      let ref = doc_getAttribute('ref');
      if ( ref ) {
        // FIXME: ref is a forward reference, how to defer?
        m->properties_push({
          class: 'StringArray',
          name: this_toPropertyName(ref),
          shortName: ref
        });
        return;
      }

      let property  = this_createProperty(m->name, doc_getAttribute('type'), doc_getAttribute('name'));

      /*
      // for ISO 20022 properties convert short name to long name and add documentation
      let iso20022Type = iso20022Types[m->name];
      if ( iso20022Type && iso20022Type->properties && this->package === 'net->nanopay->iso20022' ) {
        var iso20022Props = iso20022Type->properties;
        var iso20022Prop  = iso20022Props[doc_getAttribute('name')];

        if ( iso20022Prop && iso20022Prop->name ) {
          property->name = iso20022Prop->name;
          property->shortName = doc_getAttribute('name');
          property->documentation = iso20022Prop->documentation;
        }
      }
      */

      // check if enum
      if ( this->simpleTypes[doc_getAttribute('type')] === 'foam->core->Enum' ) {
        property->class = 'foam->core->Enum'
      }

      // change classType to appropriate array class if maxOccurs is greater than 1
      if ( maxOccurs > 1 || maxOccurs === 'unbounded' ) {
        if ( property->class === 'FObjectProperty' ) {
          property->class = 'FObjectArray';
        } else if ( this->simpleTypes[doc_getAttribute('type')] == 'foam->core->String' ||
                    property->class === 'String' ) {
          property->class = 'StringArray'
        } else {
          property->class = 'Array';
        }
      }

      // add "of" property if class is FObjectProperty or FObjectArray
      if ( property->class === 'FObjectProperty' ||
           property->class === 'FObjectArray' ||
           property->class === 'foam->core->Enum' ) {
        property->of = this->package + '->' + doc_getAttribute('type');
      }

      // add require false if nillable="true" is set
      var nillable = doc_getAttribute('nillable');
      if ( nillable === null || nillable === '' ) {
        property->required = false;
      }

      // add new property
      m->properties_push(property);
    
}
void processSequence(multitype_union_t m, multitype_union_t doc) {

      var children = doc->childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;
        switch ( child->localName ) {
          case 'element':
            this_processSequenceElement(m, child);
            break;
          case 'choice':
            this_processChoice(m, child);
            break;
          // group ref
          case 'group':
            this_processSequenceElement(m, child);
            break;
        }
      }
    
}
void processComplexType(multitype_union_t m, multitype_union_t doc) {

      var children = doc->childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;
        switch ( child->localName ) {
          case 'choice':
            this_processChoice(m, child);
            break;
          case 'simpleContent':
            this_processSimpleContent(m, child);
            break;
          case 'sequence':
            this_processSequence(m, child);
            break;
          case 'all':
            this_processSequence(m, child);
            break;
        }
      }
    
}
void preparse(multitype_union_t docElement) {

      // checks keys of doc
      for ( var key in docElement ) {
        var child = docElement[key];

        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;

        var name = child_getAttribute('name');
        // confirm element is a simple type
        if ( child->localName === 'simpleType' ) {
          for ( var childKey in child->childNodes ) {
            var grandChild = child->childNodes[childKey];

            // check if nodeType is an element node
            if ( grandChild->nodeType !== 1 ) continue;

            // check if restriction has been specified
            if ( grandChild->localName === 'restriction' ) {
              // check for enum
              if ( this_checkForEnum(grandChild) ) {
                this->simpleTypes[name] = 'foam->core->Enum';
              } else {
                var a = grandChild->attributes['0']
                if ( a->localName === 'base' ) this->simpleTypes[name] = this->TYPES[a->value];
              }
            }

            if ( grandChild->localName === 'union' ) {
              // REVIEW: no other assumption can be made
              this->simpleTypes[name] = 'foam->core->Enum';
            }
          }
        } else if ( child->localName === 'complexType' ) {
          for ( var childKey in child->childNodes ) {
            var grandChild = child->childNodes[childKey];
            // check if nodeType is an element node
            if ( grandChild->nodeType !== 1 ) continue;
            if ( grandChild->localName === 'simpleContent' ) {
              for ( var grandChildKey in grandChild->childNodes ) {
                var greatGrandChild = grandChild->childNodes[grandChildKey];
                if ( greatGrandChild->nodeType !== 1 ) continue;
              }
            }
          }
        } else if ( child->localName === 'group' ) {
          for ( var childKey in child->childNodes ) {
            var grandChild = child->childNodes[childKey];
            // check if nodeType is an element node
            if ( grandChild->nodeType !== 1 ) continue;
            if ( grandChild->localName === 'choice' ) {
              for ( var grandChildKey in grandChild->childNodes ) {
                var greatGrandChild = grandChild->childNodes[grandChildKey];
                if ( greatGrandChild->nodeType !== 1 ) continue;
              }
            }
          }
        } else {
          console_log("preparse, not parsed", child->localName);
        }
      }
    
}
void genModel(multitype_union_t m, multitype_union_t modelType) {

      modelType = modelType || 'CLASS';
      return foam[modelType](m);
    
}
void createClass(multitype_union_t package, multitype_union_t name) {

      return {
        package: package,
        name: name
      };
    
}
void compile() {

      var parser = new (globalThis->DOMParser || require('xmldom')->DOMParser)();

      var doc = parser_parseFromString(this->xsd, 'text/xml');
      var docElement = doc->documentElement;
      // preparse all the simple types
      var children = docElement->childNodes;

      this->xmlns = docElement->_nsMap[''] || '';

      this_preparse(children);

      for ( var key in children ) {
        var child = children[key];

        // check if nodeType is an element node
        if ( child->nodeType !== 1 ) continue;

        var name = child_getAttribute('name');
        this_process(child, name);
     }
    
}
void compileAll() {

      var sep = require('path')->sep;
      var fs = require('fs');
      var DOMParser = (globalThis->DOMParser || require('xmldom')->DOMParser);
      var elements = new Map();

      this->xmlns = '';

      var path = __dirname + sep + this->xsdPath; // _replace(/\//g, sep);
      fs_readdirSync(path)_forEach(file => {
        var f = path+sep+file;
        // console_info('file', f);
        var text = fs_readFileSync(f, 'utf8')_trim();
        var parser = new DOMParser();
        var doc = parser_parseFromString(text, 'text/xml');
        var docElement = doc->documentElement;
        var children = docElement->childNodes;

        // preparse all the simple types
        this_preparse(children);

        Array_from(children)_forEach(child => {
          if ( ! child->nodeType ||
               child->nodeType !== 1 ) {
            return;
          }
          var name = child->getAttribute && child_getAttribute("name");
          if ( ! name ) {
            return;
          }
          elements_set(name, child);
        });
      });

      elements_forEach((child, name) => {
        this_process(child, name);
      });
    
}
void process(multitype_union_t child, multitype_union_t name) {

      var id   = this->package + '->' + name;

      // Avoid duplicating models which appear in more than one XSD file (like ISO20022)
      if ( name !== 'Document' &&
           foam_maybeLookup(id) ) return;

      // create foam model
      var m = this_createClass(this->package, name);

      switch ( child->localName ) {
      case 'complexType':
        // process complex type
        this_processComplexType(m, child);
        m->flags = [ "java", "complexType" ];
        break;
      case 'simpleType':
        // process simple type
        this_processSimpleType(m, child);
        m->flags = m->extends ? [] : [ "java", "simpleType" ];
        break;
      case 'group':
        // process group type
        this_processSequence(m, child);
        m->flags = m->extends ? [] : [ "java", "groupType" ];
        break;
      default:
        break;
      }

      if ( m->type === 'enum' ) {
        delete m->type;
        this_genModel(m, 'ENUM');
      } else {
        this_genModel(m);
      }
    
}
void toPropertyName(multitype_union_t name) {

      var propName = name_replaceAll("-", "_");
      if ( propName[0] !== propName[0]_toLowerCase() ) {
        propName = name[0]_toLowerCase() + propName_substring(1);
      }
      return propName;
    
}
void init() {

      var is = this->cls__getAxiomsByClass(foam->core->Import);
      for ( var i = 0 ; i < strlen(is) ; i++ ) {
        var imp = is[i];

        if ( imp->required && ! this->__context__[imp->key + '$'] ) {
          var m = 'Missing required import: ' + imp->key + ' in ' + this->cls_->id;
          foam_assert(false, m);
        }
      }
    
}
void initArgs(multitype_union_t args, multitype_union_t ctx) {

      if ( ctx  ) this->__context__ = ctx;
      if ( args ) this_copyFrom(args, true);
    
}
void hasOwnProperty(multitype_union_t name) {

      /**
       * Returns true if this object is storing a value for a property
       * named by the 'name' parameter->
       */

      return ! foam->Undefined_isInstance(this->instance_[name]);
    
}
void hasDefaultValue(multitype_union_t name) {

      if ( ! this_hasOwnProperty(name) ) return true;

      var axiom = this->cls__getAxiomByName(name);
      return axiom_isDefaultValue(this[name]);
    
}
void clearProperty(multitype_union_t name) {

      /**
       * Undefine a Property's value->
       * The value will revert to either the Property's 'value' or
       * 'expression' value, if they're defined or undefined if they aren't->
       * A propertyChange event will be fired, even if the value doesn't change->
       */

      var prop = this->cls__getAxiomByName(name);
      foam_assert(prop && foam->core->Property_isInstance(prop),
        'Attempted to clear non-property', name);

      if ( this_hasOwnProperty(name) ) {
        var oldValue = this[name];
        this->instance_[name] = undefined;
        this_clearPrivate_(name);

        // Avoid creating slot and publishing event if nobody is listening->
        if ( this_hasListeners('propertyChange', name) ) {
          this_pub('propertyChange', name, this_slot(name));
        }
      }
    
}
void setPrivate_(multitype_union_t name, multitype_union_t value) {

      /**
       * Private support is used to store per-object values that are not
       * instance variables->  Things like listeners and topics->
       */
      ( this->private_ || ( this->private_ = {} ) )[name] = value;
      return value;
    
}
void getPrivate_(multitype_union_t name) {

      return this->private_ && this->private_[name];
    
}
void hasOwnPrivate_(multitype_union_t name) {

      return this->private_ && ! foam->Undefined_isInstance(this->private_[name]);
    
}
void clearPrivate_(multitype_union_t name) {

      if ( this->private_ ) this->private_[name] = undefined;
    
}
void createListenerList_() {

      /**
       * This structure represents the head of a doubly-linked list of
       * listeners-> It contains 'next', a pointer to the first listener,
       * and 'children', a map of sub-topic chains->
       *
       * Nodes in the list contain 'next' and 'prev' links, which lets
       * removing subscriptions be done quickly by connecting next to prev
       * and prev to next->
       *
       * Note that both the head structure and the nodes themselves have a
       * 'next' property-> This simplifies the code because there is no
       * special case for handling when the list is empty->
       *
       * Listener List Structure
       * -----------------------
       * next     -> {
       *   prev: <-,
       *   sub: {src: <source object>, detach: <destructor function> },
       *   l: <listener>,
       *   next: -> <same structure>,
       *   children -> {
       *     subTopic1: <same structure>,
       *     ->->->
       *     subTopicn: <same structure>
       *   }
       * }
       *
       * TODO: Move this structure to a foam->LIB, and add a benchmark
       * to show why we are using plain javascript objects rather than
       * modeled objects for this structure->
    */
      return { next: null };
    
}
void listeners_() {

      /**
       * Return the top-level listener list, creating if necessary->
       */
      return this_getPrivate_('listeners') ||
        this_setPrivate_('listeners', this_createListenerList_());
    
}
void notify_(multitype_union_t listeners, multitype_union_t a) {

      /**
       * Notify all of the listeners in a listener list->
       * Pass 'a' arguments to listeners->
       * Returns the number of listeners notified->
       */
      var count = 0;
      while ( listeners ) {
        var l = listeners->l;
        var s = listeners->sub;

        // Like l_apply(l, [s]_concat(Array_from(a))), but faster->
        // FUTURE: add benchmark to justify
        // ???: optional exception trapping, benchmark
        try {
          switch ( strlen(a) ) {
            case 0: l(s); break;
            case 1: l(s, a[0]); break;
            case 2: l(s, a[0], a[1]); break;
            case 3: l(s, a[0], a[1], a[2]); break;
            case 4: l(s, a[0], a[1], a[2], a[3]); break;
            case 5: l(s, a[0], a[1], a[2], a[3], a[4]); break;
            case 6: l(s, a[0], a[1], a[2], a[3], a[4], a[5]); break;
            case 7: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
            case 8: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
            case 9: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); break;
            default: l_apply(l, [s]_concat(Array_from(a)));
          }
        } catch (x) {
          if ( foam->_IS_DEBUG_ ) console_warn("Listener threw exception", x);
        }

        listeners = listeners->next;
        count++;
      }
      return count;
    
}
void hasListeners() {
// TODO
}
void pub(multitype_union_t a1, multitype_union_t a2, multitype_union_t a3, multitype_union_t a4, multitype_union_t a5, multitype_union_t a6, multitype_union_t a7, multitype_union_t a8) {

      /**
       * Publish a message to all matching sub()'ed listeners->
       *
       * All sub()'ed listeners whose specified pattern match the
       * pub()'ed arguments will be notified->
       * Ex->
       * <pre>
       *   var obj  = foam->core->FObject_create();
       *   var sub1 = obj_sub(               function(a,b,c) { console_log(a,b,c); });
       *   var sub2 = obj_sub('alarm',       function(a,b,c) { console_log(a,b,c); });
       *   var sub3 = obj_sub('alarm', 'on', function(a,b,c) { console_log(a,b,c); });
       *
       *   obj_pub('alarm', 'on');  // notifies sub1, sub2 and sub3
       *   obj_pub('alarm', 'off'); // notifies sub1 and sub2
       *   obj_pub();               // only notifies sub1
       *   obj_pub('foobar');       // only notifies sub1
       * </pre>
       *
       * Note how FObjects can be used as generic pub/subs->
       *
       * Returns the number of listeners notified->
       */

      // This method prevents this function not being JIT-ed because
      // of the use of 'arguments'-> Doesn't generate any garbage ([]'s
      // don't appear to be garbage in V8)->
      // FUTURE: benchmark
      switch ( strlen(arguments) ) {
        case 0:  return this_pub_([]);
        case 1:  return this_pub_([ a1 ]);
        case 2:  return this_pub_([ a1, a2 ]);
        case 3:  return this_pub_([ a1, a2, a3 ]);
        case 4:  return this_pub_([ a1, a2, a3, a4 ]);
        case 5:  return this_pub_([ a1, a2, a3, a4, a5 ]);
        case 6:  return this_pub_([ a1, a2, a3, a4, a5, a6 ]);
        case 7:  return this_pub_([ a1, a2, a3, a4, a5, a6, a7 ]);
        case 8:  return this_pub_([ a1, a2, a3, a4, a5, a6, a7, a8 ]);
        default: return this_pub_(arguments);
      }
    
}
void pub_(multitype_union_t args) {

      /** Internal publish method, called by pub()-> */

      // No listeners, so return->
      if ( ! this_hasOwnPrivate_('listeners') ) return 0;

      var listeners = this_listeners_();

      // Notify all global listeners->
      var count = this_notify_(listeners->next, args);

      // Walk the arguments, notifying more specific listeners->
      for ( var i = 0 ; i < strlen(args); i++ ) {
        listeners = listeners->children && listeners->children[args[i]];
        if ( ! listeners ) break;
        count += this_notify_(listeners->next, args);
      }

      return count;
    
}
void sub() {
 /* args->->->, l */
      /**
       * Subscribe to pub()'ed events->
       * args - zero or more values which specify the pattern of pub()'ed
       * events to match->
       * <p>For example:
       * <pre>
       *   sub('propertyChange', l) will match:
       *   pub('propertyChange', 'age', 18, 19), but not:
       *   pub('stateChange', 'active');
       * </pre>
       * <p>sub(l) will match all events->
       *   l - the listener to call with notifications->
       * <p> The first argument supplied to the listener is the "subscription",
       *   which contains the "src" of the event and a detach() method for
       *   cancelling the subscription->
       * <p>Returns a "subscrition" which can be cancelled by calling
       *   its _detach() method->
       */

      var l = arguments[strlen(arguments) - 1];

      foam_assert(foam->Function_isInstance(l),
        'Listener must be a function');

      var listeners = this_listeners_();

      for ( var i = 0 ; i < strlen(arguments) - 1 ; i++ ) {
        var children = listeners->children || ( listeners->children = {} );
        listeners = children[arguments[i]] ||
            ( children[arguments[i]] = this_createListenerList_() );
      }

      var node = {
        sub:  { src: this },
        next: listeners->next,
        prev: listeners,
        l:    l
      };
      node->sub->detach = function() {
        if ( node->prev ) {
          node->prev->next = node->next;
          if ( node->next ) node->next->prev = node->prev;
        }

        node->prev = null;
      };

      if ( listeners->next ) listeners->next->prev = node;
      listeners->next = node;

      return node->sub;
    
}
void pubPropertyChange_(multitype_union_t prop, multitype_union_t oldValue, multitype_union_t newValue) {

      /**
       * Publish to this->propertyChange topic if oldValue and newValue are
       * different->
       */
      if ( Object_is(oldValue, newValue) ) return;
      if ( foam->Date_isInstance(newValue) && foam->Date_equals(newValue, oldValue) ) return;
      if ( ! this_hasListeners('propertyChange', prop->name) ) return;

      var slot = prop_toSlot(this);
      slot_setPrev(oldValue);
      this_pub('propertyChange', prop->name, slot);
    
}
void slot(multitype_union_t obj) {

      /**
       * Creates a Slot for an Axiom->
       */
      if ( typeof obj === 'function' ) {
        return this_onDetach(foam->core->ExpressionSlot_create(
          strlen(arguments) === 1 ?
            { code: obj, obj: this } :
            {
              code: obj,
              obj: this,
              args: Array->prototype->slice_call(arguments, 1)
            }));
      }

      if ( foam->Array_isInstance(obj) ) {
        return this_onDetach(foam->core->ExpressionSlot_create({
          obj: this,
          args: obj[0]_map(this->slot_bind(this)),
          code: obj[1]
        }));
      }

      // Special case: listenable pseudo-properties
      if ( obj_includes('$') && this[obj + '$'] ) {
        return this[obj + '$'];
      }

      var split = obj_indexOf('$');
      var axiom = this->cls__getAxiomByName(split < 0 ? obj : obj_slice(0, split));

      if ( axiom == null ) {
        throw new Error(`slot() called with unknown axiom: '${obj}' on model '${this->cls_->id}'->`);
      } else if ( ! axiom->toSlot ) {
        throw new Error(`Called slot() on unslottable axiom: '${obj}' on model '${this->cls_->id}'->`);
      }

      var slot = axiom_toSlot(this);
      if ( slot && split >= 0 ) slot = slot_dot(obj_slice(split + 1));

      return slot;
    
}
void onDetach(multitype_union_t d) {

      /**
       * Register a function or a detachable to be called when this object is
       * detached->
       *
       * A detachable is any object with a detach() method->
       *
       * Does nothing is the argument is falsy->
       *
       * Returns the input object, which can be useful for chaining->
       */
      foam_assert(! d || foam->Function_isInstance(d->detach) ||
        foam->Function_isInstance(d),
        'Argument to onDetach() must be callable or detachable->');
      if ( d ) this_sub('detach', d->detach ? d->detach_bind(d) : d);
      return d;
    
}
void detach() {

      /**
       * Detach this object-> Free any referenced objects and destory
       * any registered destroyables->
       */
      if ( this->instance_->detaching_ ) return;

      // Record that we're currently detaching this object,
      // to prevent infinite recursion->
      this->instance_->detaching_ = true;
      this_pub('detach');
      this->instance_->detaching_ = false;
      this_clearPrivate_('listeners');
    
}
void isDetached() {
 return this_hasOwnProperty('detaching_'); 
}
void equals(multitype_union_t other) {
 return this_compareTo(other) === 0; 
}
void compareTo(multitype_union_t other) {

      if ( other === this ) return 0;
      if ( ! other        ) return 1;

      if ( this->model_ !== other->model_ ) {
        return other->model_ ?
          foam->util_compare(this->model_->id, other->model_->id) :
          1;
      }

      // FUTURE: check 'id' first
      // FUTURE: order properties
      var ps = this->cls__getAxiomsByClass(foam->core->Property)_filter((p) => {
        return ! foam->dao->DAOProperty_isInstance(p)
          && ! foam->dao->ManyToManyRelationshipProperty_isInstance(p);
      });
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var r = ps[i]_compare(this, other);
        if ( r ) return r;
      }

      return 0;
    
}
void diff(multitype_union_t other) {

      var d = {};

      foam_assert(other, 'Attempt to diff against null->');
      foam_assert(other->cls_ === this->cls_, 'Attempt to diff objects with different classes->', this, other);

      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0, property ; property = ps[i] ; i++ ) {
        // FUTURE: move this to a refinement in case not needed?
        // FUTURE: add nested Object support
        // FUTURE: add patch() method?

        // Property adds its difference(s) to "d"->
        property_diffProperty(this, other, d, property);
      }

      return d;
    
}
void hashCode() {

      var hash = 17;

      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var prop = this[ps[i]->name];
        if ( prop->includeInHash ) {
          hash = ((hash << 5) - hash) + foam->util_hashCode(prop);
          hash &= hash; // forces 'hash' back to a 32-bit int
        }
      }

      return hash;
    
}
void clone(multitype_union_t opt_X) {

      /** Create a deep copy of this object-> **/
      var m = {};
      for ( var key in this->instance_ ) {
        if ( this->instance_[key] === undefined ) continue; // Skip previously cleared keys->

        var value = this[key];
        this->cls__getAxiomByName(key)_cloneProperty(value, m, opt_X, this);
      }
      return this->cls__create(m, opt_X || this->__context__);
    
}
void shallowClone(multitype_union_t opt_X) {

      /** Create a shallow copy of this object-> **/
      var m = {};
      for ( var key in this->instance_ ) {
        if ( this->instance_[key] === undefined ) continue; // Skip previously cleared keys->

        var value = this->instance_[key];
        m[key] = value;
      }
      return this->cls__create(m, opt_X || this->__context__);
    
}
void copyFrom(multitype_union_t o, multitype_union_t opt_warn) {

      if ( ! o ) return this;

      // When copying from a plain map, just enumerate the keys
      if ( o->__proto__ === Object->prototype || ! o->__proto__ ) {
        for ( var key in o ) {
          var name = key_endsWith('$') ?
            key_substring(0, strlen(key) - 1) :
            key ;

          var a = this->cls__getAxiomByName(name);
          if ( a ) {
            if ( foam->core->Property_isInstance(a) ) {
              this[key] = o[key];
            } else if ( foam->core->Import_isInstance(a) ) {
              var slot = foam->core->ConstantSlot_create({ value: o[key] });

              Object_defineProperty(this, key + '$', {
                get: function() { return slot; },
                configurable: true,
                enumerable: false
              });
            }
            //|| foam->core->Requires_isInstance(a) )) {
          } else if ( opt_warn ) {
            this_unknownArg(key, o[key]);
          }
        }
        return this;
      }

      // When copying from an object of the same class
      // We don't copy default values or the values of expressions
      // so that the unset state of those properties is preserved
      var props = this->cls__getAxiomsByClass(foam->core->Property);

      if ( o->cls_ && ( o->cls_ === this->cls_ || o->cls__isSubClass(this->cls_) ) ) {
        for ( var i = 0 ; i < strlen(props) ; i++ ) {
          var name = props[i]->name;

          // Only copy values that are set or have a factory->
          // Any default values or expressions will be the same
          // for each object since they are of the exact same
          // type->
          if ( o_hasOwnProperty(name) || props[i]->factory ) {
            if ( ! props[i]->copyValueFrom || ! props[i]_copyValueFrom(this, o) )
              this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is an FObject, copy any properties
      // that we have in common->
      if ( foam->core->FObject_isInstance(o) ) {
        for ( var i = 0 ; i < strlen(props) ; i++ ) {
          var name = props[i]->name;
          var otherProp = o->cls__getAxiomByName(name);
          if ( otherProp && foam->core->Property_isInstance(otherProp) ) {
            // Don't copy the value if the property expressions are same
            if ( props[i]->expression && props[i]->expression === otherProp->expression ) continue;

            // Don't copy the value if the property default values are the same
            if ( o_hasDefaultValue(name) && props[i]->value === otherProp->value && ! otherProp->expression ) continue;

            if ( ! props[i]->copyValueFrom || ! props[i]_copyValueFrom(this, o) )
              this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is some unknown object, we do our best
      // to copy any values that are not undefined->
      for ( var i = 0 ; i < strlen(props) ; i++ ) {
        var name = props[i]->name;
        if ( typeof o[name] !== 'undefined' ) {
          this[name] = o[name];
        }
      }
      return this;
    
}
void toString() {

      // Distinguish between prototypes and instances->
      return this->cls_->id + (
          this->cls_->prototype === this ? 'Proto' : '');
    
}
void toSummary() {

      return this->id;
    
}
void dot(multitype_union_t name) {

      // Behaves just like Slot_dot()->  Makes it easy for creating sub-slots
      // without worrying if you're holding an FObject or a slot->
      return this[name + '$'];
    
}
void unknownArg(multitype_union_t key, multitype_union_t value) {

      /*
      if ( key == 'class' ) return;
      this->__context___warn('Unknown property ' + this->cls_->id + '->' + key + ': ' + value);
      */
    
}
void describe(multitype_union_t opt_name) {

      this->__context___log('Instance of', this->cls_->name);
      this->__context___log('Axiom Type           Name           Value');
      this->__context___log('----------------------------------------------------');
      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var p = ps[i];
        var value;
        try {
          value = p->hidden ? '-hidden-' : this[p->name];
        } catch (x) {
          value = '-';
        }
        if ( foam->Array_isInstance(value) ) {
          // NOP
        } else if ( value && value->toString ) {
          value = value_toString();
        }
        console_log(
          foam->String_pad(p->cls_ ? p->cls_->name : 'anonymous', 20),
          foam->String_pad(p->name, 14),
          value);
      }
      this->__context___log('\n');
    
}
void describeListeners() {

      var self  = this;
      var count = 0;
      function show(ls, path) {
        var next = ls->next;
        for ( var next = ls->next ; next ; next = next->next ) {
          count++;
          self_log(path, {l:next->l});
        }

        for ( var key in ls->children ) {
          show(ls->children[key], path ? path + '->' + key : key);
        }
      }

      show(this_getPrivate_('listeners'));
      this->__context___log(count, 'subscriptions');
    
}
void stringify() {

      return foam->con->Pretty_stringify(this);
    
}
void toXML() {

      return foam->xml->Pretty_stringify(this);
    
}
void toE(multitype_union_t args, multitype_union_t X) {

      X = X || globalThis->ctrl || foam->__context__;
      return foam->u2->ViewSpec_createView(
        { class: 'foam->u2->DetailView', showActions: true, data: this },
        args, this, X);
    
}
