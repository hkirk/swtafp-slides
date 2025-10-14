
<!-- .slide: data-background="#003d73" -->
## Functional Architecture

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----


### Agenda

* Problem<br/><!-- .element: class="fragment" -->
* Ports & Adapters<br/><!-- .element: class="fragment" -->
* Generalization<br/><!-- .element: class="fragment" -->
* Other<br/><!-- .element: class="fragment" -->

---

### Layered architecture


![Classic 3 layer architecture](./img/3layer.png)

* Breaks DIP<br/><!-- .element: class="fragment" -->
    * BLL depends on details in DAL
* BLL calls impure code<br/><!-- .element: class="fragment" -->

Note:



----

#### Satisfying DIP

![Updated 3 layer architecture](./img/3layer2.png)

----


#### Usecase for creating invoices

* Creating a **PDF** invoice, requires
    * Products
    * Prices before and after taxes
    * Customer information
    * Date
    * Invoice number

----

#### OO way of implementing the above

```csharp
public void GenerateInvoice(Order order, Customer customer)
{
    // ...
}
```

* This has side-effect, invoice number, date, output where?<br/><!-- .element: class="fragment" -->
* Hard to test!<br/><!-- .element: class="fragment" -->

Note:

* Invoice number is generated (or gotten from a DB)
* Date is 'read'

----

#### Extending with internalization

```csharp
public void GenerateInvoice(Order order,
                            Customer customer,
                            Language lang) {}
```

* Problems from side-effects?<br/><!-- .element: class="fragment" -->

![Invoice-lang](./img/invoice-lang.png)<!-- .element: class="fragment" -->

----

#### Problems

So each call to `GeneateInvoice` increments invoice number :(

----

#### Solution

![Invoice-lang-fp](./img/invoice-lang-fp.png)

Note:

GenerateTemplate and CreateInvoice should be pure functions

---

#### Hexagonal architecture

also known as Ports and Adapters

![Hexagonal Architeture](./img/Hexagonal_Architecture.png "https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)") <!-- .element style="height:400px" -->

By Alistair Cockburn 

----

## Ports & Adapters

* Components<!-- .element: class="fragment" -->
    * loosely coupled and interchangeable
    * e.g. database, ui, business logic, etc. etc.
* Ports<!-- .element: class="fragment" -->
    * 'interface' that components can access other components through
* Adapters<!-- .element: class="fragment" -->
    * glue between components and ports

Note: Not only for FP - but very used especially in FP so e.g. F# and Haskell

----

<!-- TODO: New example - from example -->
<!-- in that case link to this for inspiration: https://jkone27-3876.medium.com/f-onion-architecture-in-92-lines-of-code-129c5d7877ca -- >

### A Restaurant example

```fsharp
module BLL

type Error = CapacityExceeded
type Reservation = {Quantity: int}

let check capacity getReservedSeats reservation =
    let reservedSeats = getReservedSeats reservation
    if (capacity < reservation.Quantity + reservedSeats)
    then Result.Error CapacityExceeded
    else Result.Ok reservation
// val check :
//  capacity:int ->
//  getReservedSeats:(Reservation -> int) ->
//  reservation:Reservation -> Result<Reservation,Error>
```

----

### Controller / Use case

* Restaurant check if reservation can be accepted


```fsharp
let connStr = "..."
let reserveTable = 
    Validate.reservation
    >> bind (BLL.check 10 (getReservedSeatsFromDb connStr))
    >> map (saveReservation connStr) // same as below
  //>> map (fun res -> (saveReservation connStr) res)
```

----

### Inject `getReservedSeats`

```fsharp
let getReservedSeatsFromDb (connStr: string)
                           (reservations: Reservation): int = 
    failwith "Not implemented"

let getReservedSeats = getReservedSeatsFromDb connStr
// val getReservedSeats : (Reservation -> int)
```

* <!-- .element: class="fragment" --> 'getReservedSeats' has sideeffect
    * signature shows no sign of being impure

----

### Partial application

* <!-- .element: class="fragment" -->Our pure function <code>check</code>, will be impure in production<br/>
    * by injecting `getReservedSeatsFromDb`
* <!-- .element: class="fragment" -->But why do <code>check</code> need <code>getReservedSeats</code> at all?

Note:

It don't - but if layered architecture kindof forces it to.

----

### Refactor `check`

```fsharp
let check capacity reservedSeats reservation =
    if (capacity < reservation.Quantity + reservedSeats)
    then Result.Error CapacityExceeded
    else Result.Ok reservation
```

----

### Calling check

So now calling '`check`' is a bit more tedious

```fsharp
let connStr = ".."
let reserveTable =
  Validate.reservation
    >> map  (getReservedSeatsFromDb connStr res, res)
    >> bind (fun (capacity, res) ->  
                        BLL.check 10 capacity res)
    >> map  (saveReservation connStr)
```

Note:

`>>` function composition

```
let (>>) f g x = g (f x)

let add1 x = 1+x
let times2 x = x*2

let add1Times2 = (>>) add1 times2
let add1Times2' = add1 >> times2
```

----

### Reuse logic

* What is business logic?<br/><!-- .element: class="fragment" -->
* What is application logic?<br/><!-- .element: class="fragment" -->
* Does 'reserveTable' belong in the BLL?<br/><!-- .element: class="fragment" --> 

----

### The function `reserveTable`

1. could be application logic<br/><!-- .element: class="fragment" --> 
1. thereby not something you would necessary reuse<br/><!-- .element: class="fragment" --> 
1. because:<br/><!-- .element: class="fragment" --> 
    * handle reservation validation in the same manner?
    * handle input/output different

----

### Take-aways

1. Read data (impure)<br/><!-- .element: class="fragment" -->
1. Hand data to BLL (pure)<br/><!-- .element: class="fragment" -->
1. Save data (impure)<br/><!-- .element: class="fragment" -->
1. Return/show data (impure)<br/><!-- .element: class="fragment" -->

---

## Generalization

* Pure functions<br/><!-- .element: class="fragment" -->
* Impure functions
* Know which are which<!-- .element: class="fragment" -->
    * and how to separate

----

### Calling functions

1. <!-- .element: class="fragment" -->Pure functions <b>may</b> call other pure functions<br/>
2. <!-- .element: class="fragment" -->Impure functions <b>may</b> call other impure functions<br/>
3. <!-- .element: class="fragment" -->Impure functions <b>may</b> call other pure functions<br/>
4. <!-- .element: class="fragment" --><i>Pure functions <b>may not</b> call other impure functions</i><br/>

----

### ??

Is my function `a()` pure or not?

----

### Ports and Adapters
##### or hexagonal architecture

* One way of avoiding DAL contaminating BLL<br/><!-- .element: class="fragment" --> 
* Alternative to layered architecture<br/><!-- .element: class="fragment" --> 
* Each component is connected through a number of ports<br/><!-- .element: class="fragment" --> 
* <!-- .element: class="fragment" --> Not always the correct solution

----

### Onion architecture

![Onion architecture](./img/onion-architecture.png) <!-- .element style="height: 260px" -->

* Onion architecture was inspired by Hexogonal architecture<br/><!-- .element: class="fragment" -->
* Layered architecture<!-- .element: class="fragment" --> 
    * where inner circles have no knowledge of outer circle


----

### Onion Arch. pro/cons

* \- e.g. database is accessible from UI<br/><!-- .element: class="fragment" -->
    * they are in same layer - not a good idea though.
* \+ fewer artifacts then ports and adapters<br/><!-- .element: class="fragment" -->

---

### Broker architecture

![Broker architecture](./img/broker-architecture.png "https://www.researchgate.net/figure/The-Broker-architectural-pattern_fig2_330079838")

Looks like microservices, right?

----

### Pipe and filter
##### or reactive programming

![Pipe and Filter](./img/pipe-and-filter.jpg "https://csblogpro.wordpress.com/2017/11/05/pipe-and-filter-architecture/")

note:

We will take a closer look at this later

---

## References

* [Conditional composition of functions](https://blog.ploeh.dk/2016/07/04/conditional-composition-of-functions/)
* Other reading material: [Ports'n'Adapters](https://gist.github.com/hkdobrev/b68b7fe77adfb409f5add21ba4664d12)