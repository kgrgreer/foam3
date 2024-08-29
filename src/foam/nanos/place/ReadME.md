# Google Places API Integration

## API Document:
Overview: *https://developers.google.com/maps/documentation/places/web-service/overview*
Place Autocomplete: *https://developers.google.com/maps/documentation/places/web-service/autocomplete*


## Usage
1. Create GooglePlaceServiceConfigure for the spid that you provide Place service for in googlePlaceServiceConfigureDAO.
2. See **Test In UI Console** section for example.
3. For more options setting see GooglePlaceServiceConfigure.js

## Test In UI Console:

#### Place Autocomplete
```
var b = await ctrl.__subContext__.placeService.PlaceAutocomplete(null, "56 Colonsay")
for(let p of b.predictions){console.log(p.description, p.placeId)}
```

#### Place Detail
```
var d = await ctrl.__subContext__.placeService.placeDetail(null, "YOUR_PLACE_ID")
console.log(d.result.formattedAddress)
for(let v of d.result.addressComponents){console.log(v.toSummary())}
```

## Tip to save the cost:
- Session Token: *https://developers.google.com/maps/documentation/places/web-service/autocomplete#sessiontoken*
- Fields(Place Details): *https://developers.google.com/maps/documentation/places/web-service/details#fields*