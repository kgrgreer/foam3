// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class FObjectParser: ProxyParser {

  public var defaultClass: Any! {
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

  var _defaultClass_: Any! = nil

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

  lazy var parseString$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let str = args[0] as! String

    
    return self!.`parseString`(
        _: str)
  }
])
      
  }()

  public static let PARSE_STRING: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parseString"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `FObjectParser__create`(_ args: [String:Any?] = [:]) -> FObjectParser_ {
    
return __subContext__.create(FObjectParser_.self, args: args)!
      
  }

  public func `StringPStream_create`(_ args: [String:Any?] = [:]) -> StringPStream {
    
return __subContext__.create(StringPStream.self, args: args)!
      
  }

  private func `_defaultClass_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any! {
    return newValue
  }

  private func `_defaultClass_preSet_`(_ oldValue: Any?, _ newValue: Any!) -> Any! {
    return newValue
  }

  private func `_defaultClass_postSet_`(_ oldValue: Any?, _ newValue: Any!) {
    
  }

  private func `_delegate_factory_`() -> Parser {
    
return
  Seq1(["index": 3, "parsers": [
    Whitespace(),
    Literal(["string": "{"]),
    Whitespace(),
    FObjectParser_(["defaultClass": self.defaultClass]),
    Whitespace(),
    Literal(["string": "}"]),
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

  public func `parseString`(_ str: String) -> FObject? {
    
let ps = StringPStream_create(["str": str])
let x = ParserContext()
x.set("X", __subContext__)
return parse(ps, x)?.value() as? FObject
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return FObjectParser.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return FObjectParser.classInfo_
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


  case "parseString": return `parseString$`

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
  
    lazy var id: String = "foam.swift.parse.json.FObjectParser"

    lazy var label: String = "FObject Parser"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [DEFAULT_CLASS,DELEGATE,PARSE_STRING]

    lazy var cls: AnyClass = FObjectParser.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return FObjectParser(args, x)
    }

  }

}