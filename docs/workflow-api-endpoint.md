# Workflow: Implementing new API endpoint

- Use TDD style: implement tests first, let them fail, implement functionality until tests pass (without changing tests)
- IMPORTANT! Always run `npm test` when you completed the workflow and, if tests fail, keep iterating until you fix all of them
- Write a plan for yourself with tasks as todo items
- Write comprehensive tests. Write more comments in tests. Create test file covering all scenarios:
  - Happy Path
  - Validation Errors (params and body)
  - Not Found
  - Service Errors
  - Other test scenarios, if needed
- Run tests - Use `npm test` to verify each test fails
- Create schemas. Define request/response schemas in `src/lib/schemas/`
- Implement service functions. Add business logic in `src/lib/services/` (use functions, not classes)
- Create route handler. Implement API route in `src/app/api/v1/` using `withErrorHandling`
- Run tests - Use `npm test` to verify each test passes
- Iterate and fix until tests pass
- Run linter - Use `npm run lint` to ensure code quality
- Update `@docs/data-model.md` ("Main Queries" section) by adding a checkmark `[x]` next to the corresponding query, if it was used in API endpoint implementation. If it's not in the list of queries, then add it.
- Provide a short summary of each added test: what it tests, how it does it