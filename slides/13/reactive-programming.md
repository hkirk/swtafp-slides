<!-- .slide: data-background="#003d73" -->

## Reactive programming

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

---


### Reactive programming

* Declarative paradigm
    * responding to events
* Imparative vs declarative

```fsharp [1-3|4-8]
// Imparative
let a = b + c
// a is assigned and never changed
// Reactive
let a' = b + c
b <- 'new_value'
// a is now recombuted
```


----

### Reactive programming

* Learing curve<br/><!-- .element: class="fragment" -->
* ReactiveX<!-- .element: class="fragment" -->
    * RXjs (used in Angular, ..)
    * Rx.NET
    * RxJava
    * ...
* Akka.Stream (C#/Java)<br/><!-- .element: class="fragment" -->

----

### When to use

* Emitting and consuming events are async<br/><!-- .element: class="fragment" -->
* Events are async<br/><!-- .element: class="fragment" -->
* Events and Reactive programming<br/><!-- .element: class="fragment" -->
    * robustness
    * extend


---

### Creating events

```fsharp [1-11|12-15]
let createTimer timerInterval eventHandler =
    let timer = new System.Timers.Timer(float timerInterval)
    timer.AutoReset <- true

    timer.Elapsed.Add eventHandler

    async {
        timer.Start()
        do! Async.Sleep 5000
        timer.Stop()
    }
// call createTimer
let basicHandler _ = printfn "tick1 %A" DateTime.Now
let basicTimer1 = createTimer 1000 basicHandler
Async.RunSynchronously basicTimer1
```

----

### Using the built in F# Observable

```fsharp [1-13|14-21]
let createTimerAndObservable timerInterval =
    let timer = new System.Timers.Timer(float timerInterval)
    timer.AutoReset <- true

    let observable = timer.Elapsed

    let task = async {
        timer.Start()
        do! Async.Sleep 5000
        timer.Stop()
    }

    (task,observable)
// Calling from somewhere else
let basicTimer2, timerEventStream =
        createTimerAndObservable 1000
timerEventStream
|> Observable.subscribe //basicHandler
        (fun _ -> printfn "tick2 %A" DateTime.Now)
|> ignore // disposable not disposed 
Async.RunSynchronously basicTimer2
```

note:

Convertion from C# IEvent to F# IObservable (simplified)

Happens in the compiler



----

### Piping events

```fsharp
let timerCount2, timerEventStream = createTimerAndObservable 500
timerEventStream
|> Observable.scan (fun count _ -> count + 1) 0
|> Observable.subscribe (fun count -> printfn "1 timer ticked with count %i" count)
|> ignore // disposable not disposed 
```

----

### Merging events

![Live code](https://resources.jetbrains.com/storage/products/rider/img/meta/preview.png "" )

---

### Akka Streams

* Streaming model built on top of Akkas actors<br/><!-- .element: class="fragment" -->
* Backpressure is handled explictly by framwork<br/><!-- .element: class="fragment" -->
* Can be distributed on different nodes<br/><!-- .element: class="fragment" -->
* Error handling uses Supervision strategy<br/><!-- .element: class="fragment" -->

----

* Source - originator for data<br/><!-- .element: class="fragment" -->
* Flow - subscribe, process and proceed<br/><!-- .element: class="fragment" -->
* Sink - Endpoint stream<br/><!-- .element: class="fragment" -->
* Graph DSL<br/><!-- .element: class="fragment" -->
    * With faning out `Broadcast` and `Balance`, ...
    * and faning in `MergePrefered`, ...


----

### Difffences

* Observable<!-- .element: class="fragment" -->
    * Declarative
    * Stateless
    * LINQ syntax
* Akka Stream<!-- .element: class="fragment" -->
    * actor based
    * State can be hold in actors
    * Distributed
    * Backpressure



---

### References 

* [Observable](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-control-observablemodule.html)
* [F# For fun and profits](https://fsharpforfunandprofit.com/posts/concurrency-reactive/)