# Paywise — Web (React frontend)

Frontend for **Paywise**, an employee and salary management application. It talks to the
Rails API (`paywise-api`) over JSON. Sign-in uses email/password with a JWT from Rails, and the
employee screens use `GET /api/v1/users`. Salaries still use sample data — see
[What is real and what is not](#what-is-real-and-what-is-not).

> ⚠️ Frontend route guards are never a security boundary. Rails must enforce authentication and
> authorisation on every endpoint.

## Tech stack

| Concern           | Library                                       |
| ----------------- | --------------------------------------------- |
| Build / dev       | Vite 8, TypeScript 5.9                        |
| UI                | React 19, Tailwind CSS 4, Lucide icons        |
| Routing           | React Router 7 (data router)                  |
| Server state      | TanStack Query 5                              |
| Forms             | React Hook Form 7 + Zod 4                     |
| Tests             | Vitest 5, React Testing Library, jsdom        |
| Lint              | Oxlint                                        |

## Getting started

Requirements: **Node.js 22** (Vite 8 needs ≥ 20.19). With nvm: `nvm use` (reads `.nvmrc`).

```bash
# Terminal 1 — the Rails API on port 3000
cd ../Paywise && bin/rails server

# Terminal 2 — this app
npm install
npm run dev          # http://localhost:5173
```

In development the browser only talks to `localhost:5173`; Vite forwards every `/api/...` request
to Rails on `localhost:3000` (see `server.proxy` in `vite.config.ts`). That's why no CORS setup is
needed in Rails while developing.

### Commands

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the dev server with hot reload                 |
| `npm test`           | Run the test suite once                              |
| `npm run test:watch` | Run tests in watch mode                              |
| `npm run typecheck`  | TypeScript check (no output files)                   |
| `npm run lint`       | Lint `src/` with Oxlint                              |
| `npm run build`      | Typecheck, then build to `dist/`                     |
| `npm run preview`    | Serve the production build locally                   |

### Environment variables

See `.env.example`. `.env.development` and `.env.test` hold committed, non-secret defaults;
put personal overrides in `.env.development.local` (git-ignored).

| Variable                | Purpose                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | Base URL of the Rails API. Empty = same origin (dev proxy). Read only in `src/config/appConfig.ts`. |
| `API_PROXY_TARGET`      | Dev server only: where `/api` is forwarded (default `http://localhost:3000`). Not bundled. |

Anything starting with `VITE_` is compiled into the JavaScript bundle and is **public**.
Never put secrets (OAuth client secrets, API keys) in these files — those belong in Rails.

## Project structure

```
src/
  app/                  App wiring
    routes.tsx            Route table (shared by the browser router and tests)
    router.tsx            createBrowserRouter(routes)
    providers.tsx         Global providers (TanStack Query)
    queryClient.ts        QueryClient defaults
  config/appConfig.ts   The one place that reads environment variables
  services/
    apiClient.ts          fetch wrapper: base URL, Bearer token, 401 → sign out
    sessionStore.ts       The JWT + signed-in user, kept in memory only
  features/             Data + logic per domain — no JSX layout here
    authentication/       authApi (sign-in endpoint), session hooks, ProtectedRoute, RequireRole
    employees/            employeeApi + railsUser (Rails JSON → Employee), query hooks, form schema
    salaries/             salaryApi (still sample data), query hooks
  mock/                 Sample data generator, used only by salaries and tests
  components/
    ui/                   Generic building blocks: Button, Card, DataTable, Pagination, form controls…
    layout/               AppLayout, Sidebar, Topbar, PageHeader, BrandMark
    employees/            EmployeeTable, EmployeeForm, dashboard widgets
    salaries/             SalaryTable
  pages/                One component per route; composes features + components
  hooks/                Reusable hooks (useListState, useDebouncedValue)
  types/                Shared TypeScript types (Employee, SalaryRecord, CurrentUser, list types)
  utils/                Small pure helpers (formatting, class names)
  test/                 Test setup and the renderApp helper
```

How the employee list loads:

```
EmployeesPage → useEmployeeList(params) → employeeApi.listAll() → apiClient.get('/api/v1/users') → Rails
                       └─ search / filter / sort / page in the browser (utils/listQuery.ts) for now
```

Rails JSON is validated and converted to the frontend `Employee` type in one place,
`features/employees/railsUser.ts` (e.g. `country_code: "IN"` → `country: "India"`).

### Routes

| Path                  | Screen                    | Access                       |
| --------------------- | ------------------------- | ---------------------------- |
| `/login`              | Sign-in                   | Public                       |
| `/dashboard`          | Headcount overview        | Signed in                    |
| `/employees`          | Employee list             | Signed in                    |
| `/employees/new`      | Add employee              | Signed in                    |
| `/employees/:id`      | Employee details          | Signed in                    |
| `/employees/:id/edit` | Edit employee             | Signed in                    |
| `/salaries`           | Compensation list         | Signed in, `admin` / `hr_manager` |

## What is real and what is not

| Area             | Today                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| Sign-in          | Email + password → `POST /api/v1/login` (**must be added to Rails**, see below). The JWT is kept in memory only — never localStorage — so a page refresh or token expiry (15 min) sends you back to sign in. Google SSO is commented out. |
| Employee list, details, dashboard | Real: `GET /api/v1/users`. Rails returns all users at once, so the app downloads them once (cached 5 min) and searches/filters/sorts/pages in the browser. Only one page of rows is rendered. |
| Add / edit employee | Form and validation work; saving shows "not available yet" because there's no create/update API. Nothing is faked. |
| Salaries         | Sample data (fictional people), clearly labelled on the page.            |

## Important React concepts used (for a Rails developer)

- **Components** are functions that return JSX (HTML-like syntax). Think of them as partials
  with typed arguments (*props*).
- **State** (`useState`) is data that, when changed, re-renders the component. `useListState`
  bundles the search/filter/sort/page state for a table — a bit like a form object.
- **Effects** (`useEffect`) run side effects after render (e.g. the debounce timer, the Escape-key
  listener). They return a cleanup function.
- **Custom hooks** (`useSomething`) are functions that reuse hook logic — similar to concerns.
- **TanStack Query** caches server data by *query key* (`['employees', 'list', params]`). It gives
  you `isPending`, `isError`, `data`, and refetches/invalidates after mutations — so you rarely
  store server data in `useState`. `placeholderData: keepPreviousData` keeps the old page on screen
  while the next one loads.
- **React Router** maps URLs to components. `<Outlet />` is where child routes render (like
  `yield` in a Rails layout). `ProtectedRoute` and `AppLayout` are *layout routes* wrapping the
  signed-in pages. Every page is lazy-loaded (code splitting).
- **React Hook Form + Zod**: the Zod schema (`employeeFormSchema.ts`) is the single source of
  validation rules and of the form's TypeScript type (`z.infer`). Like model validations, but
  client-side only — Rails must still validate.
- **Keys**: lists use each record's stable `id` as `key` so React can track rows correctly.
- **Context / providers**: `AppProviders` makes the query cache available to every component.

## Testing

Tests render the real route table in a memory router (`src/test/renderApp.tsx`), so they exercise
pages the way a user does.

`fetch` is replaced by a small fake Rails API (`src/test/railsApiStub.ts`) that returns
Rails-shaped JSON, so the real `apiClient` → mapper → UI path is exercised.

Covered: employee table rendering, search, filters, empty state, sorting, pagination and page size,
form validation, save-not-available error, edit prefill, login validation, wrong credentials,
successful sign-in with the Bearer token sent, 401 → back to login, not-found employee, navigation
between the main screens, and the dashboard showing no compensation.

## Roles (UI only — Rails must enforce the same rules)

Defined in `src/features/authentication/permissions.ts`, using `role_name` from the login response.

| Role                 | Dashboard & employees | See salaries & audits | Update salaries |
| -------------------- | --------------------- | --------------------- | --------------- |
| Admin                | ✓                     | ✓                     | ✓               |
| HR Manager           | ✓                     | ✓                     | ✓               |
| HR                   | ✓                     | ✓                     | —               |
| Any other role       | Can't sign in         | —                     | —               |

## What Rails needs next

The frontend already calls these; each path lives in one `*Api.ts` file.

| Endpoint | Used by | Status |
| -------- | ------- | ------ |
| `POST /api/v1/login` → `{ token, user: { id, name, email, role_id, role_name } }` | Sign-in | Exists |
| `GET /api/v1/users` | Employees, dashboard, name look-ups | Exists |
| `GET /api/v1/salaries` | Current salaries | Exists — add `user: { only: [:id, :name, :country_code] }` to avoid the users look-up |
| `POST /api/v1/salaries` `{ id, salary_record: { compensation, currency, effective_from } }` → 200 / 403 / 404 / 422 | Update salary dialog (Admin, HR Manager) | Exists |
| `GET /api/v1/historic_records` → `employment_histories` rows | Salary audits page | Route added — use `api/v1/employment_histories#index` |
| Pagination/search params on the list endpoints | All lists | Needed at 10k+ rows |
| Create / update / show for users | Add/edit employee | Missing |

Rails must also check roles on every salary endpoint (e.g. with the CanCan `Ability`), and for
production set `VITE_API_BASE_URL` and enable CORS (or serve both from one domain).


=======================================================

# Paywise — Frontend Technical Requirements and Architecture

## 1. Project Overview

Paywise is an employee management application designed to manage employee information, salary records, and role-based access to application features.

The frontend is built using React and TypeScript, with a separate Ruby on Rails backend exposing REST APIs. The application provides an interactive interface for users while enforcing access permissions based on their assigned roles.

The frontend integrates with the backend for authentication, employee data, salary information, and other application operations.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based user interface development |
| TypeScript | Static type checking and improved code maintainability |
| Vite | Frontend development server and build tooling |
| React Hooks | Component state and lifecycle management |
| REST APIs | Communication with the Rails backend |
| JWT | Authentication token handling |
| Role-Based Access Control (RBAC) | Restricting frontend features based on user roles |
| CSS | Application styling and layout |
| Git and GitHub | Version control and source code management |

## 3. Requirements Understanding

The frontend requirements were understood around the following functional areas.

### 3.1 Authentication
- Provide a user interface for signing in.
- Integrate with the Rails authentication API.
- Handle authentication responses and JWT tokens.
- Maintain the authenticated user's session according to the implemented session-management approach.
- Handle unauthorized API responses appropriately.

### 3.2 Employee Management
- Display employee information retrieved from the backend.
- Provide interfaces for viewing employee details.
- Support employee-related operations according to the user's permissions.

### 3.3 Salary Management
- Display salary records received from the backend.
- Provide salary update functionality to authorized roles.
- Display validation and API error messages to users.

### 3.4 Role-Based Access
- Adapt the interface based on the authenticated user's role.
- Restrict access to relevant pages, actions, and controls.
- Align frontend permissions with the backend authorization rules.

## 4. Frontend Architecture

The application follows a component-based architecture, separating user interface elements, page-level functionality, authentication state, and backend communication.

```text
React + TypeScript Frontend
          |
          v
   Application UI
          |
          v
     Page Components
          |
          v
 Authentication & Role Checks
          |
          v
    API Integration Layer
          |
          v
     REST API Requests
          |
          v
   Ruby on Rails Backend
          |
          v
       PostgreSQL
```

### Key architectural components

**Components:** Reusable UI elements that keep the interface modular and consistent.

**Pages:** Application screens for employee information, salary records, and other workflows.

**Authentication handling:** Manages the authenticated user's information and token according to the implemented authentication flow.

**Authorization handling:** Determines which frontend features are available to the current user based on their role.

**API integration:** Communicates with the Rails backend and processes successful responses and errors.

## 5. TypeScript Implementation

TypeScript is used to introduce static typing to the React application.

### Benefits
- Defines expected structures for API responses and application data.
- Helps identify type-related errors during development.
- Improves IDE support, autocomplete, and refactoring.
- Makes component props and function parameters easier to understand.
- Improves maintainability as the application grows.

For example, an employee model can be represented using an interface:

```typescript
interface Employee {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
}
```

This provides a clear structure for employee data used throughout the frontend.

## 6. Authentication and JWT Integration

The React application integrates with the Rails authentication endpoint to authenticate users.

### Authentication flow

1. The user enters their login credentials.
2. React sends the credentials to the Rails authentication API.
3. Rails validates the credentials.
4. The backend returns a JWT and the relevant user information after successful authentication.
5. The frontend maintains the authentication state using the implemented token and session-management approach.
6. Authenticated API requests include the token as required by the backend.
7. Unauthorized responses are handled by the frontend.

The Rails backend remains responsible for validating the token and authenticating protected API requests.

## 7. Frontend Role-Based Access Control

Role-based access control is implemented on the React side to adapt the user interface according to the authenticated user's role.

### Objectives
- Display only the actions relevant to the user's permissions.
- Restrict access to role-specific pages and sections.
- Prevent unauthorized actions through the user interface.
- Keep frontend role checks aligned with backend authorization policies.

### Example role-access matrix

| Feature | Admin | HR Manager | HR |
|---|---|---|---|
| View employee information | Yes | Yes | Yes |
| Create employee records | Yes | Yes | No |
| Update employee records | Yes | Yes | No |
| Delete employee records | Yes | No | No |
| Update salary records | Yes | Yes | No |

This matrix represents the intended access model and should match the final backend permission configuration.

### How frontend authorization works

The frontend checks the authenticated user's role before rendering restricted controls or allowing access to protected routes.

For example:

```tsx
interface RoleGuardProps {
  allowedRoles: string[];
  userRole: string;
  children: React.ReactNode;
}

function RoleGuard({
  allowedRoles,
  userRole,
  children,
}: RoleGuardProps) {
  if (!allowedRoles.includes(userRole)) {
    return <p>You do not have permission to access this feature.</p>;
  }

  return <>{children}</>;
}

export default RoleGuard;
```

This reusable component illustrates how role checks can be centralized rather than duplicated across individual components.

**Security principle:** Frontend authorization improves the user experience, but it is not a security boundary. The Rails backend must independently enforce permissions for every protected operation.

## 8. API Integration and Error Handling

The frontend communicates with the Rails backend through REST API endpoints.

The integration layer is responsible for:
- Sending requests to the appropriate API endpoints.
- Passing authentication information when required.
- Processing JSON responses.
- Handling authentication failures and permission errors.
- Displaying meaningful validation messages.
- Managing loading and error states where applicable.

Common HTTP responses include:

| Status Code | Meaning | Frontend Handling |
|---|---|---|
| 200 | Request successful | Display or update the returned data |
| 201 | Resource created | Confirm successful creation |
| 401 | Unauthenticated | Handle the authentication failure |
| 403 | Forbidden | Inform the user that access is restricted |
| 404 | Resource not found | Display an appropriate message |
| 422 | Validation failed | Display validation errors |

## 9. Performance and Maintainability

The frontend architecture supports maintainability and efficient rendering through the following practices:

- **Reusable components:** Reduce duplicated UI code.
- **TypeScript interfaces:** Make data contracts easier to understand and maintain.
- **Component-based design:** Keeps unrelated UI responsibilities separated.
- **Centralized authorization logic:** Reduces duplicated role checks.
- **API separation:** Keeps backend communication distinct from presentation components.
- **Appropriate state management:** Keeps UI state predictable and easier to debug.
- **Production builds with Vite:** Compile and optimize frontend assets for deployment.

## 10. Testing Considerations

Frontend testing should cover the core user journeys and authorization behavior.

Key scenarios include:
- Successful and unsuccessful login.
- Handling unauthorized API responses.
- Rendering the correct interface for different roles.
- Hiding or restricting actions that the current role cannot perform.
- Displaying employee and salary data.
- Handling API validation errors.
- Ensuring restricted users cannot access protected functionality through direct navigation.

## 11. AI-Assisted Development

AI tools were used as development assistants during implementation and documentation.

Typical uses included:
- Exploring implementation approaches.
- Assisting with React and TypeScript code.
- Reviewing authentication and authorization flows.
- Identifying potential errors and edge cases.
- Improving code readability and documentation.

AI-generated suggestions were evaluated against the application's requirements and existing implementation.

## 12. Implementation Summary

The Paywise frontend provides a React and TypeScript interface integrated with a Rails REST API.

The implementation brings together:
- A modular, component-based React architecture.
- TypeScript for stronger typing and maintainability.
- JWT-based authentication integration.
- Frontend role-based access control.
- Employee and salary management interfaces.
- REST API integration and error handling.
- A clear separation between frontend responsibilities and backend security enforcement.

Together, these components provide a structured foundation for an employee management application with role-aware user experiences and maintainable frontend code.