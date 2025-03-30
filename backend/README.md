## Chronus Backend
* Written in NestJS

## Notes:


### Validation choice
* Choosing to do authorization in the TS, not in a middleware/guard, because `UpdateNoteTransactionScript` will need the `note`. It is more natural to get that in the domain, and not through some middleware/guard. 


## Installation

```bash
$ npm install
```

## Running the app
```bash
$ npm run dev
```

## Test

```bash
# unit tests
$ npm run test
```

