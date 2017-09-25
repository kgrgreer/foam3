// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class PropertyParser: ProxyParser {

  public var property: PropertyInfo {
    get {
      
if _property_inited_ {
  return _property_!
}

fatalError("No default value for property")

      
    }
set(value) {
      
self.set(key: "property", value: value)
      
    }
  }

  var _property_: PropertyInfo! = nil

  var _property_inited_: Bool = false

  public static let PROPERTY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "property"
  let classInfo: ClassInfo
  let transient = false
  let label = "Property" // TODO localize
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

  private lazy var property_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "property",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var property_Value_Sub_: Subscription?

  public var property$: Slot {
    get {
      return self.property_Value_
    }
set(value) {
      
self.property_Value_Sub_?.detach()
self.property_Value_Sub_ = self.property$.linkFrom(value)
self.onDetach(self.property_Value_Sub_!)
      
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

  private func `_property_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> PropertyInfo {
    return newValue as! PropertyInfo
  }

  private func `_property_preSet_`(_ oldValue: Any?, _ newValue: PropertyInfo) -> PropertyInfo {
    return newValue
  }

  private func `_property_postSet_`(_ oldValue: Any?, _ newValue: PropertyInfo) {
    
  }

  private func `_delegate_factory_`() -> Parser {
    
return 
  Seq1(["index": 5, "parsers": [
    Whitespace(),
    KeyParser(["key": self.property.name]),
    Whitespace(),
    Literal(["string": ":"]),
    Whitespace(),
    self.property.jsonParser!,
    Whitespace(),
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
    
let ps = super.parse(ps, x);
if ps == nil { return nil }
let args = x.get("obj") as! Reference<[String:Any?]>
args.value[property.name] = ps!.value()
return ps
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return PropertyParser.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return PropertyParser.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "property":
    _property_inited_ = false
    _property_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "property"]) {
      _ = pub(["propertyChange", "property", property$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "property": return `_property_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "property": return `property`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "property": return `property$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "property$":
    property$ = value as! Slot
    return
  case "property":
  
    let oldValue: Any? = _property_inited_ ? self.`property` : nil
    _property_ = _property_preSet_(oldValue, _property_adapt_(oldValue, value))
    _property_inited_ = true
    _property_postSet_(oldValue, _property_)
    if hasListeners(["propertyChange", "property"]) && !FOAM_utils.equals(oldValue, _property_) {
      _ = pub(["propertyChange", "property", property$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.PropertyParser"

    lazy var label: String = "Property Parser"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [PROPERTY,DELEGATE,PARSE]

    lazy var cls: AnyClass = PropertyParser.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return PropertyParser(args, x)
    }

  }

}