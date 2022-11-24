# Development Guidelines

Here are som guidlines for developers to help maintain the quality of our application.

## Frontend Coding Checklist

1. Are you loading data? Make sure you have the following components in your view:

   - \<LoadingPlaceholder /\>
   - \<ErrorMessage /\>
   - \<EmptyPlaceholder /\>

2. Always wrap you text with the translator and add translations:

   - `i18n("your text")`
   - english: [kpm-frontend/src/i18n/en.ts](kpm/kpm-frontend/src/i18n/en.ts)
   - swedish: [kpm-frontend/src/i18n/sv.ts](kpm/kpm-frontend/src/i18n/sv.ts)

3. Add a Jest snapshot test to make sure your component can be rendered

   - with some expected data
   - when loading
   - with an error
   - when empty

## Backend Coding Checklist

1. Make sure you have error handlers for all external API calls and DB calls (typically anything with an await)

   - se section [Error Handling](#error-handling) below

2. Wrap returned data in an object

3. Make sure you have defined the API endpoint and Error Types in [kpm-backend-interface/src/index.ts](kpm/kpm-backend-interface/src/index.ts)

   - `type APIXxxErrType = "xxx" | "yyy";`
   - `type APIXxx = { ... }`

## Error Handling

### Frontend developer

1. To see the shape of errors passed to frontend, check [kpm-api-commons/src/index.ts](packages/kpm-api-common/src/index.ts):

   - function errorHandler()

2. To see what error types you can get for each endpoint, check [kpm-backend-interface/src/index.ts](kpm/kpm-backend-interface/src/index.ts):

   - APIXxxErrType for each endpoint (Xxx)

3. To see what authentication error types you can get, check [kpm-backend-interface/src/index.ts](kpm/kpm-backend-interface/src/index.ts):

   - TAuthErrType

### Backend developer

There are three types of errors that should be thrown by your code:

- EndpointError — common errors such as external APIs failing or data validation errors
- RecoverableError — less common errors that occur IN YOUR CODE that you need to inform the user about
- AuthError — missing credentials to access this service (not external API-auth errors, they should be an EndpointError)

All other errors are passed and logged as unexpected errors.

1. catch any external API-calls with an error handler and return EndpointError\<APIXxxErrType\>

   - Make sure you add a string to APIXxxErrType with each type you return
   - The error handler needs `Error.captureStackTrace()` for async stack trace of errors you don’t handle
   - Set statusCode to 4xx becuase Everest turns 5xx to HTML response page

2. (optional) catch code that you know might fail but is okay and return RecoverableError\<APIXxxErrType\>

   - Make sure you define APIXxxErrType with each type you return in **kpm-backend-interface/src/index.ts**

3. Implement AuthError for authentication errors

- Make sure you define AuthErrType with each type you return in **kpm-backend-interface/src/index.ts**
