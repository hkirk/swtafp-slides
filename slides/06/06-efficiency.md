<!-- .slide: data-background="#003d73" -->
## Stack, Heap & Optimization

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

### Agenda

* Stack/Heap
* Big-O
* Recursion
  * Tail recursion
* Optimization

---

## Stack and Heap

* Much like C#, Java, etc.
* Memory is split into Stack and Heap

----

### Stack

* Holds primitive values
    * Some objects
* Reference for objects on Heap

----

### Stack frame

* Values/objects bound at the same level is kept in a stackframe
* Evaluating local declarations will push a stackframe on top
* When result is found/computed - stackframe wil be popped

----

### Measuring time

* Can be done in FSI with
    * `#time;;`

```fsharp
> #time;;

>pow ("1233456", 56);;
Real: 00:00:00.049, CPU: 00:00:00.037, 
    GC gen0: 1, gen1: 1, gen2: 0
val it : string =
  "1233456123345612334561233456123345612334561233456123345612334561233456123345612334561233456123345612334561233456123345612334
```

---

## Big-O
TODO: Should this be included and what?

---

## Recursion

* We use recursion to do loops
* This can blow the stack
    * recursive call creates a new stack frame

!["Recursion](./img/recursion.jpg "Recusion") <!-- .element style="height: 200px;" -->

----

### Example

From week 1:

```fsharp
let rec pow = function
    | (s: string, 1) -> s
    | (s: string, n) -> s + pow (s, n-1)
```

After the recusive call there are still work in this function - add s to result

----

### Tail Recursion

From book:

```fsharp
let rec fact = function
    | (0, m) -> m
    | (n, m) -> fact (n-1, n*m)
```

This is tail recursive - last call is the recursive call

----

### Generalization of 

Looping on a special form:

```fsharp
let rec tr p f h z = if p z then tr p f h (f z) else h z;;
val tr : p:('a -> bool) ->
         f:('a -> 'a) ->
         h:('a -> 'b) ->
         z:'a -> 'b
```

----

### Implementing factorial by `tr`

```fsharp
let fact' = tr (fun (n,_) -> n<>0)
               (fun (n,m) -> (n-1, m*n))
               (fun (_,m) -> m)

// For reference
let rec fact = function
    | (0, m) -> m
    | (n, m) -> fact (n-1, n*m)
```

----

### Comparison

```fsharp
> fact' (30,1);;
Real: 00:00:00.000, CPU: 00:00:00.000, 
          GC gen0: 0, gen1: 0, gen2: 0
val it : int = 1409286144

> fact (30,1);;   
Real: 00:00:00.000, CPU: 00:00:00.000,
          GC gen0: 0, gen1: 0, gen2: 0
val it : int = 1409286144
```

----

### Properties of tail recursive functions

* Evaluation `tr p f h (f z)` will not build large expressions
    * `f z` will be evaluated at each step
* This can be O(n) - in the fact example
* The same evironment/stack frame can be reused

----

### Using continuations to optimize

* Accumulative parameter (as above) is not always possible
* Continuations is a genenral pattern for making tail-recursion

In general we will transform:

```fsharp
f: 'a -> 'b
// into
f: 'a -> ('b -> 'b) -> 'b
```

----

### Example

```fsharp
let rec bigListC n c =                          
    if n=0 then c []                            
    else bigListC (n-1) (fun res ->
        printfn "execute %d" (n-1)
        c((n-1)::res)
    )

bigListC 3 (fun a -> a);;
// val it : int list = [1; 1; 1]
```

----

### Analysis 

// TODO: Big-O analisys of space + complexity

----

### Example

---

## Optimization

// TODO: Include complexity for basic list, set, map operations
