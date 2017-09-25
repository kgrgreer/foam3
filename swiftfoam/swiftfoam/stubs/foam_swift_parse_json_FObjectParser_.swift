// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class FObjectParser_: ProxyParser {

  public var defaultClass: ClassInfo? {
    get {
      
if _defaultClass_inited_ {
  return _defaultClass_
}

return nil

      
    }
set(value) {
      
self.set(key: "defaultClass", value: value)
      
    }
  }

  var _defaultClass_: ClassInfo? = nil

  var _defaultClass_inited_: Bool = false

  public static let DEFAULT_CLASS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "defaultClass"
  let classInfo: ClassInfo
  let transient = false
  let label = "Default Class" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var defaultClass_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "defaultClass",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var defaultClass_Value_Sub_: Subscription?

  public var defaultClass$: Slot {
    get {
      return self.defaultClass_Value_
    }
set(value) {
      
self.defaultClass_Value_Sub_?.detach()
self.defaultClass_Value_Sub_ = self.defaultClass$.linkFrom(value)
self.onDetach(self.defaultClass_Value_Sub_!)
      
    }
  }

  override public var delegate: Parser {
    get {
      
if _delegate_inited_ {
  return _delegate_!
}

self.set(key: "delegate", value: _delegate_factory_())
return _delegate_!

      
    }
set(value) {
      
self.set(key: "delegate", value: value)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `KeyParser_create`(_ args: [String:Any?] = [:]) -> KeyParser {
    
return __subContext__.create(KeyParser.self, args: args)!
      
  }

  public func `StringParser_create`(_ args: [String:Any?] = [:]) -> StringParser {
    
return __subContext__.create(StringParser.self, args: args)!
      
  }

  public func `Whitespace_create`(_ args: [String:Any?] = [:]) -> Whitespace {
    
return __subContext__.create(Whitespace.self, args: args)!
      
  }

  public func `Literal_create`(_ args: [String:Any?] = [:]) -> Literal {
    
return __subContext__.create(Literal.self, args: args)!
      
  }

  public func `Optional_create`(_ args: [String:Any?] = [:]) -> Optional {
    
return __subContext__.create(Optional.self, args: args)!
      
  }

  public func `Seq1_create`(_ args: [String:Any?] = [:]) -> Seq1 {
    
return __subContext__.create(Seq1.self, args: args)!
      
  }

  private func `_defaultClass_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> ClassInfo? {
    return newValue as! ClassInfo?
  }

  private func `_defaultClass_preSet_`(_ oldValue: Any?, _ newValue: ClassInfo?) -> ClassInfo? {
    return newValue
  }

  private func `_defaultClass_postSet_`(_ oldValue: Any?, _ newValue: ClassInfo?) {
    
  }

  private func `_delegate_factory_`() -> Parser {
    
return 
  Seq1(["index": 4, "parsers": [
    KeyParser(["key": "class"]),
    Whitespace(),
    Literal(["string": ":"]),
    Whitespace(),
    StringParser(),
    Optional(["delegate": 
      Literal(["string": ","]),
    ])
  ]])
      
  }

  private func `_delegate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Parser {
    return newValue as! Parser
  }

  private func `_delegate_preSet_`(_ oldValue: Any?, _ newValue: Parser) -> Parser {
    return newValue
  }

  private func `_delegate_postSet_`(_ oldValue: Any?, _ newValue: Parser) {
    
  }

  public override func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var ps: PStream? = ps
let ps1 = delegate.parse(ps!, x)

guard let c: ClassInfo = ps1 != nil ?
    __subContext__.lookup(ps1!.value() as! String) :
    __subContext__.lookup("defaultClass") ?? defaultClass else {
  return nil
}

if ps1 != nil {
 ps = ps1
}


let subx = x.sub()
let args: Reference<[String:Any?]> = Reference(value: [:])
subx.set("obj", args)
ps = ModelParserFactory.getInstance(c).parse(ps!, subx)

if ps != nil {
  let obj = c.create(args: args.value, x: x.get("X") as! Context)
  return ps!.setValue(obj)
}

return nil
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return FObjectParser_.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return FObjectParser_.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "defaultClass":
    _defaultClass_inited_ = false
    _defaultClass_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "defaultClass"]) {
      _ = pub(["propertyChange", "defaultClass", defaultClass$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "defaultClass": return `_defaultClass_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "defaultClass": return `defaultClass`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "defaultClass": return `defaultClass$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "defaultClass$":
    defaultClass$ = value as! Slot
    return
  case "defaultClass":
  
    let oldValue: Any? = _defaultClass_inited_ ? self.`defaultClass` : nil
    _defaultClass_ = _defaultClass_preSet_(oldValue, _defaultClass_adapt_(oldValue, value))
    _defaultClass_inited_ = true
    _defaultClass_postSet_(oldValue, _defaultClass_)
    if hasListeners(["propertyChange", "defaultClass"]) && !FOAM_utils.equals(oldValue, _defaultClass_) {
      _ = pub(["propertyChange", "defaultClass", defaultClass$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.FObjectParser_"

    lazy var label: String = "FObject Parser_"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [DEFAULT_CLASS,DELEGATE,PARSE]

    lazy var cls: AnyClass = FObjectParser_.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return FObjectParser_(args, x)
    }

  }

}