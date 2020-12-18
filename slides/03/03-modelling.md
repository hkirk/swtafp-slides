# Type / Model based programing


----

## Agenda

* Types
  * Union
  * Sum
  * Enumerations
* Modeling
* Examples



---

## Types

TODO: something about types?

----

### Abbrev 

* Type alias

```fsharp
type ProductName = string
type parseProductName = ProductName -> Option<ProductName>
```

----

### Product type

* Tuples

```fsharp
type Birthday = Person * Date
```

----

### Records

```fsharp
type StructPoint = 
    { X: float
      Y: float
      Z: float }
```

----

### Sum

* Discriminated Unions
* uses of `of`

```fsharp
type Meassurement = Cm | Meter | Kilometer
type IntOrBool =
  | I of Int
  | B of Bool
```

----

### Options

```fsharp
type Option<'a> =
   | Some of 'a
   | None
```

----

### Enumeration

* Simular to sum type
  * Uses `Equal` and and `int` value

```fsharp
type Meassurement = CM = | Meter = 1 | Kilometer = 2
```

---

## Modelling

TODO: better example from SWD/DAB?

```fsharp
type Contact = {
  FirstName: string
  MiddleName: string
  LastName: string

  EmailAddress: string
  IsEmailVerified: bool
}
```

How can we do better?

----

### Optional

* Use types to express business constraints

```fsharp [3]
type Contact = {
  FirstName: string
  MiddleName: string option
  LastName: string

  EmailAddress: string
  IsEmailVerified: bool
}
```

----

#### Single choice types

* Two strings are not interchangeable
* Create Email in on places

```fsharp [1-4|8-12]
type Email = | Email of string

modules Email =
  let createEmail (s: String): Option<Email>
     = failWith "implement"

type NameInfo = {
  FirstName: String50
  MiddleName: string50 option
  LastName: string50

  Email: Email
  IsEmailVerified: bool
}
```

----

### Linked fields

* Easier to reuse 

```fsharp [1-5|6-9|11-14]
type NameInfo = {
  FirstName: String50
  MiddleName: string50 option
  LastName: string50
}
type EmailInfo {
  EmailAddress: Email
  IsEmailVerified: bool
}

type Contact = {
  name: NameInfo
  email: EmailInfo
}
```

----

### Constraint

- Business logic in types

```fsharp
type EmailInfo {
  EmailAddress: Email
  IsEmailVerified: bool
}
```

- Here we want `IsEmailVerified` to change to false, whenever a new email is used
- Not all should be able to set `IsEmailVerified`

----

### Constraint 2

```fsharp
TODO: Check why
type VerifiedEmail = VerifiedEmail of Email

type VerifyEmailSerice =
  (Email * Hash) -> VerifiedEmail

type EmailInfo =
  | Verified of VerifiedEmail
  | UnVerifiedEmail of Email

```

----

### Documentation

* All code on the previeus slides are compilable code
* Can argue that most can be read by non-F# programmers
* Document constraints and logic
* Develops a language we can use to talk about the code

TODO: image

----

### Avoid errors

* New requirements: Email or Postal address

```fsharp
type Contact = {
  name: NameInfo
  email: EmailInfo opton
  postal: PostalInfo option
}
```

- Lets make sure we cannot represent and error state

----

### Make illegal states unrepresentable

```fsharp
type Contactinfo =
  | OnlyEmail of EmailInfo
  | OnlyPostal of PostalInfo
  | BothEmailAndPostal of EmailInfo * PostalInfo

type Contact = {
  name: NameInfo
  contact: ContactInfo
}
```

What about if there should be a secondary contact address?

----

### Domain Driven Design

TODO: Just to mention?


---

## Examples


---

## Quadritic equations

---

## Cash registry

---

## Map Colering

---

## State machine

---

# References

Inspirations from: 

https://fsharpforfunandprofit.com/ddd/
