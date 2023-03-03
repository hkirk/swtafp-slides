<!-- .slide: data-background="#003d73" -->
## Property based testing

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

### Agenda

* Setting up test project
* Property based testing
* FsCheck

---

## Setting up


----

### Creating a Test project


![Create XUnit](./img/create.png "Create Xunit test project") <!-- .element: style="height: 450px" -->

\* Notice `xUnit` project

----

### Install FsCheck

![FsCheck](./img/fscheck.png "Install fsCheck")

---

## Property based testing

* Example [FizzBuzz kata](https://codingdojo.org/kata/FizzBuzz/)
* Problem statement

```nohighlight
Write a program that prints the numbers from 1 to 100.
But for multiples of three print 'Fizz' instead of the
number and for the multiples of five print 'Buzz'.
For numbers which are multiples of both three and five
print 'FizzBuzz'.
```

----

### Covering with test cases

```fsharp
let ``Three should be a Fizz`` () =
    test <@ FizzBuzz.fizzBuzz 3 = "Fizz" @>
 
let ``Five should be a Buzz`` () =
    test <@ FizzBuzz.fizzBuzz 5 = "Buzz" @>
    
let ``Seven should be a number`` () = ...
let ``Nine should be a Fizz`` () = ...
let ``Fifteen should be a FizzBuzz`` () = ...
let ``Twenty-five should be a Buzz`` () = ...
```

Is this enough?<!-- .element: class="fragment" -->

----

### Properly not

```fsharp
let fizzbuzz x =
      match x with
      | 3 -> "Fizz"
      | 5 -> "Buzz"
      | 7 -> "7"
      | 9 -> "Fizz"
      | 15 -> "FizzBuzz"
      | 25 -> "Buzz"
      | _ -> failWith "Not defined"
```

So then what?<!-- .element: class="fragment" -->

----

### Creating a better tests

```fsharp
let expectedList =
      randomList |> List.map (fun i ->
      match i with
      | n when i % 3 = 0 && i % 5 = 0 -> "FizzBuzz"
      | n when i % 3 = 0 -> "Fizz"
      | n when i % 5 = 0 -> "Buzz"
      | _ -> string i)
```

* implementing the algorithm in the test code
    * so no worky :(

----

### Testing properties instead

So the properties of FizzBuzz is:

1. multiples of both three and five print 'FizzBuzz'
2. multiples of three print 'Fizz'
3. multiples of five print 'Buzz'
4. otherwise prints the numbers

----

### Testing properties

We then need

* A way to genrate
    * numbers that are multiply of 3 and 5
    * numbers that are multiply of 3 but not 5
    * numbers that are multiply of 5 but not 3
    * Numbers that are not a multiply of 3 or 5

```fsharp
let ```test multiply of three``` (x: MultiplyOfOnly3) =
    test <@ FizzBuzz.fizzBuzz x = "Fizz" @>
```
<!-- .element: class="fragment" -->

---

## FsCheck

![FsCheck](./img/fscheck-logo.png "FsCheck") <!-- .element style="height: 100px;" -->

* Works on both F# and C# and there are counterparts in Scala, Js and the original one in Haskel
* Examples are from FsChecks documentation

----

### Testing `int list`

In xUnit a tests looks like this

```fsharp [4|5-6|7]
open FsCheck
open FsCheck.Xunit

[<Property>]
let ``Reverse of reverse of a list is the original list ``
    (xs:list<int>) =
  List.rev(List.rev xs) = xs
```

----

### Output

```nohighlight
Tests.Reverse of reverse of a list is the original list 

Ok, passed 100 tests.
```

----

### For floats

Did you ever test with floats?

```fsharp [2-3]
[<Property>]
let ``Reverse of reverse of a list is the
     original list for float`` (xs:list<float>) =
  List.rev(List.rev xs) = xs
```

Would you? <!-- .element: class="fragment"   data-fragment-index="1" -->

Output: <!-- .element: class="fragment"   data-fragment-index="2" -->
```nohighlight
Falsifiable, after 6 tests (5 shrinks)
    (StdGen (1484489475, 296855114)):
Original:
[-0.0; -6.681752205; -0.0; nan; 1.797693135e+308; -0.0]
Shrunk:
[nan]
```
<!-- .element: class="fragment" data-fragment-index="2" -->

----

### FsCheck properties 

* Can test universally properties for functions or data structures
* Can not work directly on generic types like `'a`

note:

Generic types not implemented due to the many constraints that can exists for these types.

----

### Ways to use Properties

* Conditional Properties
    * form: `<condition> ===> <property>`
* Lazy properties
    * `lazy` keyword - otherwise F# is eager evaluated
* Exceptions
    * use: `throws<'e :> exn,'a> Lazy<'a>`
* More to be found here: [Properties](https://fscheck.github.io/FsCheck//Properties.html)  \*Quantified, Timed

----

# Examples

```fsharp
// conditional
let insertKeepsOrder (x:int) xs = 
    ordered xs ==> ordered (insert x xs)

// Lazy
let tooEager a = a <> 0 ==> (1/a = 1/a) // throws ex
let moreLazy a = a <> 0 ==> (lazy (1/a = 1/a))

// Exception
let expectDivideByZero() = 
    Prop.throws<DivideByZeroException,_>
        (lazy (raise <| DivideByZeroException()))

```

----

### Generating data

* Generate data with `Gen<'a>`
    * we can build our own data generators
* Data shrinkers is defined
    * `'a -> seq<'a>`
    * also customizable

note:

From FsCheck:

Generators are built from the function choose, which makes a random choice of a value from an interval, with a uniform distribution.

----

### Generator examples

```fsharp
let chooseFromList xs = 
  gen {
        let! i = Gen.choose (0, List.length xs-1) 
        return List.item i xs
      }
```

* Build from the `choose` function.
* Syntax `let!`, `get { .. }` - we will get back to this

----

### Control data

* Control data with
    * Distribution
    * Test size
* Or use existing combinators like
    * `two g`, `three g`
    * `growingElements`
    * `listOf`, `listOfLength`
    * plus many more


note:

* `two g`: generates two g's
* `growingElements xs`: grows with an element from xs
* `listOf g`: generates a list of t's 

More at https://fscheck.github.io/FsCheck/TestData.html#Useful-Generator-Combinators

----

### Other properties with FsCheck

* Can generate random functions
* Can replay failed tests

```fsharp
Check.One(
    {
        Config.Quick with Replay =
            Some <| Random.StdGen (1145655947,296144285)
    },
    fun x -> abs x >= 0
)
```
* Avoid changing state of generated objects (if mutable) 



---

<!-- .slide: data-background-image="./img/check.jpeg" -->

## Choosing properties

note:

Photo by Karolina Grabowska from Pexels

----

### Different ways

![Commutative](./img/property_commutative.png "Commutative") <!-- .element: style="height: 300px" -->

note:

Example:

`List.sort xs` -> `List.map (fun x -> x+1)` equal to
`List.map (fun x -> x+1)` -> `List.sort xs`

----

### Negation

![Inverse](./img/property_inverse.png "Inverse") <!-- .element: style="height: 300px" -->

note:

`List.rev(List.rev xs)` equal to `xs`

----

### Non-changing

![Invariant](./img/property_invariant.png "Invariant") <!-- .element: style="height: 300px" -->

note:

`sorted list` equals to `List.sort (sorted list)`

----

### Distinct

![Idempotence](./img/property_idempotence.png "Idempotence") <!-- .element: style="height: 300px" -->

note:

`List.toSet xs` equals `List.toSet (List.toSet xs)`

`x + 0` equals `x + 0 + 0`


----

### Smaller problems

![Induction](./img/property_idempotence.png "Induction") <!-- .element: style="height: 300px" -->


note:

Mathematical induction proves that we can climb as high as we like on a ladder, by proving that we can climb onto the bottom rung (the basis) and that from each rung we can climb up to the next one (the step).

— Concrete Mathematics, page 3 margins.

`[]` is sorted

`[head]` is sorted

`f :: s :: []` is sorted iff `f <= s`

`f :: s :: rest` is sorted iff `f <= s && (isSorted s::rest)`

----

### Easy Verification

![Verification](./img/property_easy_verification.png "Verification") <!-- .element: style="height: 300px" -->

note:

`string.split str |> string.concat` equals `str`

----

### Test oracle

![Test Oracle](./img/property_test_oracle.png "Test Oracle") <!-- .element: style="height: 300px" -->

---

### vs TDD

* TDD works on specific examples
* PBT on universel properties

----

This means

* PBT provides better description of requirements
* You write fewer test cases
    * but better security
* PBT forces you to consider what to implement
* PBT forces clean design

note:

Design:
* Roman literal (negative number is not working)
* 

---

## References

* https://fscheck.github.io/FsCheck/
* https://fsharpforfunandprofit.com/posts/property-based-testing-2/