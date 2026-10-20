## OOP

```fsharp
// PORT: what the use case needs from the outside world (an interface it owns)
  type IGroupStore =
      abstract Load  : Semester -> Async<Groups>      // read
      abstract Save  : NewGroup -> Async<unit>        // write

  // DOMAIN OBJECT: owns its state and guards its own rules
  type SemesterRegistry(groups: Groups, cap: int) =
      member _.Register(number, pattern) : Result<NewGroup, string> =
          if groups.HasNumber number then Error "number taken"
          elif groups.CountOn pattern >= cap then Error "pattern full"
          else Ok { number = number; pattern = pattern }

  // USE CASE: wires the port to the domain object
  type RegisterGroup(store: IGroupStore) =
      member _.Handle(semester, number, pattern, cap) = async {
          let! groups = store.Load semester  
          let registry = SemesterRegistry(groups, cap)
          match registry.Register(number, pattern) with
          | Ok group -> do! store.Save group; return Ok group
          | Error e  -> return Error e
      }

  type IGroupStore =
      abstract Load  : Semester -> Async<Groups> 
      abstract Save  : NewGroup -> Async<unit> 
  type PostgresGroupStore(conn) =
      interface IGroupStore with
          member _.Load semester = (* SELECT ... *)
          member _.Save group    = (* INSERT ... *)
```


## Ports'n'Adapters

```fsharp
// PORT: a record of functions, owned by the domain
  type GroupStore =
      { Load: Semester -> Async<Groups>
        Save: NewGroup -> Async<unit> }

  // USE CASE: depends on the port, never on the database
  let register (store: GroupStore) semester number pattern cap = async {
      let! groups = store.Load semester
      if has number groups then return Error "number taken"
      elif countOn pattern groups >= cap then return Error "pattern full"
      else
          let group = { number = number; pattern = pattern }
          do! store.Save group
          return Ok group }

  // ADAPTER: implements the port against the database
  let postgresStore (conn: string) : GroupStore =
      { Load = fun _ -> (* SELECT ... *)
        Save = fun g -> (* INSERT ... *) }
```

## Functional Core , Imperative shell

```fsharp
// CORE: pure. No ports, no Async. Test it with plain values.
  let decide (groups: Groups) cap number pattern : Result<NewGroup, string> =
      if has number groups then Error "number taken"
      elif countOn pattern groups >= cap then Error "pattern full"
      else Ok { number = number; pattern = pattern }

  // SHELL: read, decide, write. The only place with effects.
  let register (store: GroupStore) semester number pattern cap = async {
      let! groups = store.Load semester                       // READ
      match decide groups cap number pattern with             // DECIDE (pure)
      | Ok group ->
          do! store.Save group                                // WRITE
          return Ok group
      | Error e -> return Error e }
```