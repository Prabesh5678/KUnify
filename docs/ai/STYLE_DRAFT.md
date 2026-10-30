# STYLE DRAFT (from `server/`)

## 0) File inventory by role + representative files

### Entry/config
- `server/server.js`
- `server/configs/db.config.js`
- `server/configs/cloudinary.config.js`
- `server/configs/multer.config.js`

### Routes (7)
- `server/routes/admin.route.js`
- `server/routes/student.route.js`
- `server/routes/teacher.route.js`
- `server/routes/team.route.js`
- `server/routes/log.route.js`
- `server/routes/proposal.route.js`
- `server/routes/loginHistory.route.js`

### Controllers (7)
- `server/controllers/admin.control.js`
- `server/controllers/student.control.js`
- `server/controllers/teacher.control.js`
- `server/controllers/team.control.js`
- `server/controllers/log.control.js`
- `server/controllers/proposal.control.js`
- `server/controllers/loginHistory.control.js`

### Models (8)
- `server/models/student.model.js`
- `server/models/teacher.model.js`
- `server/models/team.model.js`
- `server/models/logEntry.model.js`
- `server/models/proposal.model.js`
- `server/models/loginHistory.model.js`
- `server/models/teacherProject.model.js`
- `server/models/memberContribution.model.js`

### Middleware (3)
- `server/middlewares/admin.middleware.js`
- `server/middlewares/student.middleware.js`
- `server/middlewares/teacher.middleware.js`

### Utilities
- `server/utils/helperFunctions.js`
- `server/utils/loginQueue.js`
- `server/utils/upload.utils.js`

### Most representative files (and why)
- `server/controllers/teacher.control.js` (762 lines): largest, shows auth flows, team lifecycle, log review, teacher-project CRUD, helper extraction.
- `server/controllers/team.control.js` (361 lines): strongest example of transaction-heavy state changes with session/commit/abort/finally pattern.
- `server/controllers/admin.control.js` (557 lines): strongest example of mixed strict-status and loose-status response handling.
- `server/server.js`: shows request flow and API grouping at app level.
- `server/middlewares/*.middleware.js`: shows role-token auth pattern and response inconsistency.

---

## 1) Folder structure and responsibilities

- **Route → middleware → controller flow is explicit and direct** in all mounted APIs (no service layer in between).
  - Consistency: 7/7 route files import controllers directly.

```js
// server/routes/student.route.js
import { isAuth,googleSignIn, profileCompletion, profileUpdate, getTeachers,
    getTeacherProjects, applyToProject, getMyApplications, revokeApplication,
 } from '../controllers/student.control.js';
import authStudent from '../middlewares/student.middleware.js';
studentRouter.get("/is-auth", authStudent, isAuth);
```

- **App entry mounts role-based route groups** under `/api/<role-or-domain>`.
  - Consistency: 7/7 route groups mounted this way.

```js
// server/server.js
app.use('/api/student',studentRouter);
app.use('/api/teacher',teacherRouter);
app.use('/api/admin',adminRouter);
app.use("/api/login-history", historyRouter);
app.use('/api/team',teamRouter);
app.use("/api/log", logRouter);
app.use('/api/proposal', proposalRouter);
```

- **Models contain schema constraints; controllers contain workflow logic**.
  - Consistency: 7/7 controller files import models.

```js
// server/controllers/team.control.js
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
...
const team = await Team.findById(student.teamId).session(session);
```

---

## 2) Naming conventions

- **Folders/files:** lowercase folders; file suffix by role (`.route.js`, `.control.js`, `.model.js`, `.middleware.js`).
  - Consistency: 7/7 routes, 7/7 controllers, 8/8 models, 3/3 middlewares follow this suffixing.

```js
// examples
server/routes/team.route.js
server/controllers/team.control.js
server/models/team.model.js
server/middlewares/teacher.middleware.js
```

- **Router variables:** `<domain>Router` (`studentRouter`, `teacherRouter`, etc.).
  - Consistency: 7/7 route files.

```js
const studentRouter = express.Router();
const teacherRouter= express.Router();
const adminRouter = express.Router();
```

- **Controller function names:** camelCase action names (`getTeamLogsheets`, `requestLogCorrection`, `createVisitingTeacher`).
  - Consistency: 60/60 exported controller handlers are camelCase.

- **Boolean fields and flags:** `is*`/`*Status` pattern.
  - Consistency: appears across models and controllers.

```js
// server/models/student.model.js
isTeamLeader: { type: Boolean, default: false },
isApproved: { type: Boolean, default: undefined },

// server/models/team.model.js
supervisorStatus: { type: String, default: "notRequested" },
```

- **Collections/plurals:** plural arrays for memberships (`members`, `pendingTeams`, `assignedTeams`, `appliedProjects`).

```js
// server/models/teacher.model.js
pendingTeams:[{ type:mongoose.Schema.Types.ObjectId, ref:'team' }],
approvedTeams:[{ type:mongoose.Schema.Types.ObjectId, ref:'team' }],
assignedTeams:[{ type:mongoose.Schema.Types.ObjectId, ref:'team' }],
```

---

## 3) Formatting

- **Module system:** ESM only (`import`/`export default`); no `require`, no `module.exports`.
  - Consistency: 31/31 `.js` files.

```js
import express from "express";
...
export default adminRouter;
```

- **Semicolons:** mostly used, but inconsistent spacing and density.
  - Consistency: common but not strict.

```js
const app=express();
app.use('/api/student',studentRouter);
```

- **Quotes:** both single and double quotes are used across files.
  - Inconsistent: both forms appear in the same layer.

```js
import express from 'express';
import authAdmin from "../middlewares/admin.middleware.js";
```

- **Function style:** controller handlers are exported `const` arrow async functions.
  - Consistency: 60/60 exported handlers async arrow.

```js
export const createTeam = async (req, res) => {
  ...
};
```

- **Async style:** async/await dominates; no callback-based DB flow in controllers.
  - Consistency: 7/7 controller files.

---

## 4) Route definition pattern

- **All route files instantiate `express.Router()` and export router default.**
  - Consistency: 7/7.

```js
const historyRouter = express.Router();
...
export default historyRouter;
```

- **Role-scoped path groups** (`/api/student`, `/api/teacher`, `/api/admin`) with domain routes (`/api/team`, `/api/log`, `/api/proposal`, `/api/login-history`).
  - Consistency: 7/7 mounts in entrypoint.

- **Middleware attached inline per route** rather than route-group `.use(authX)`.
  - Consistency: 42/62 route declarations include auth middleware inline.
  - Inconsistent: 20/62 routes skip auth middleware.

```js
teacherRouter.get("/my-projects", authTeacher, getMyProjects);
adminRouter.put("/assign-supervisor", assignSupervisorManually);
```

- **No URL versioning prefix** like `/v1`.
  - Consistency: 62/62 route declarations are non-versioned.

---

## 5) Controller anatomy

Typical order in most handlers:
1. read params/body/query/cookie-derived id
2. required-field guard checks
3. query/update models
4. optional transform/populate/sort
5. return `{ success, ... }` JSON
6. catch errors and return failure JSON

- Consistency: 59/60 exported controller handlers use `try/catch`.
- Exception: `admin.isAuth` returns directly without `try/catch`.

### Golden example (complete representative controller)

```js
// server/controllers/teacher.control.js
export const createMyProject = async (req, res) => {
  try {
    const { title, description, technologies } = req.body;

    if (!title || !description) {
      return res.json({
        success: false,
        message: "Title and description are required!",
      });
    }

    const project = new TeacherProject({
      teacher: req.teacherId,
      title,
      description,
      technologies: technologies || [],
    });

    await project.save();

    return res.json({ success: true, message: "Project created!", project });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
```

---

## 6) Validation approach

- **Validation is manual in handlers/middleware** (`if (!field)`, enum checks, custom conditional checks).
  - Consistency: present throughout 7/7 controller files and 3/3 middlewares.

```js
if (!title || !abstract || !keywords)
  throw new Error("All fields are required!");
if (!req.file) throw new Error("PDF file is required");
if (req.file.mimetype !== "application/pdf")
  throw new Error("Only PDF files are allowed");
```

- **No request-validation library usage** (`joi`, `zod`, `express-validator`, etc.).
  - Consistency: none found.

- **Some schema-level validation is delegated to Mongoose** (`runValidators: true`, enum/min/max).
  - Consistency: used in multiple update handlers and schemas, not universal.

```js
const teacher = await Teacher.findByIdAndUpdate(
  req.params.id,
  { position },
  { new: true, runValidators: true }
);
```

---

## 7) Error handling

- **Primary response shape** in both success and failure: JSON with `success` boolean + optional `message`/payload.
  - Consistency: dominant across controllers/middlewares.

```js
return res.json({ success: true, projects: projectsWithApplicants });
return res.json({ success: false, message: error.message });
```

- **Status code handling is inconsistent.**
  - Form A: explicit status (`res.status(...).json(...)`) appears heavily in `admin.control.js`, `proposal.control.js`, `loginHistory.control.js`, `teacher.control.js`, `admin.middleware.js`.
  - Form B: plain `res.json(...)` without status appears heavily in `student.control.js`, `team.control.js`, `log.control.js`, `student.middleware.js`, `teacher.middleware.js`.

```js
// explicit
return res.status(401).json({ success: false, message: "Invalid credentials" });

// implicit default status
return res.json({ success: false, message: "Unauthorized" });
```

- **No centralized error middleware**; each handler catches and returns.
  - Consistency: 59/60 handlers with local `try/catch`.

---

## 8) Auth and middleware patterns

- **Cookie-based JWT auth** for role tokens: `studentToken`, `teacherToken`, `adminToken`.
  - Consistency: token creation in 4 places; verification in all 3 auth middlewares.

```js
// token creation
const studentToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
res.cookie("studentToken", studentToken, { httpOnly: true, ... });

// token verification
const tokenDecode = jwt.verify(studentToken, process.env.JWT_SECRET);
req.studentId = tokenDecode.id;
```

- **Role checking depth differs by middleware.**
  - `admin.middleware` verifies `decoded.role === "admin"`.
  - student/teacher middlewares only check presence of `id` in token payload.

```js
if (decoded.role !== "admin") {
  return res.status(403).json({ success: false, message: "Unauthorized" });
}
```

- **Middleware composition is route-level, not compositional chains of reusable policy middleware.**
  - Consistency: single auth middleware + single controller per route is dominant.

---

## 9) Model and database patterns

- **Mongoose schemas with inline constraints** (`required`, `unique`, `enum`, `default`, `min/max`).
  - Consistency: 8/8 models.

- **Timestamps are common but not universal.**
  - Consistent in 6/8 models (`student`, `team`, `proposal`, `logEntry`, `teacherProject`, `memberContribution`).
  - Not present in `teacher`, `loginHistory`.

- **Model export style is inconsistent.**
  - 6/8 use `mongoose.models.<name> || mongoose.model(...)` guard.
  - 2/8 export direct `mongoose.model(...)`.

```js
// guarded
const Team = mongoose.models.team || mongoose.model("team", teamSchema);

// direct
export default mongoose.model("proposal", proposalSchema);
```

- **Transactional writes used for multi-document operations.**
  - Consistency: 10 handlers start session + transaction.

```js
session = await mongoose.startSession();
session.startTransaction();
...
await session.commitTransaction();
```

---

## 10) Configuration and environment

- **Environment variables are read directly via `process.env` inside runtime code.**
  - Consistency: used across config, middleware, controllers, and utils.

```js
await mongoose.connect(`${process.env.MONGODB_URI}`);
const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
```

- **dotenv loading is split:** global side-effect import in `server.js`, explicit `dotenv.config()` in cloudinary config.
  - Inconsistent style, but both coexist.

```js
import "dotenv/config";
...
import dotenv from 'dotenv';
dotenv.config();
```

---

## 11) Comments/documentation and logging habits

- **Comments are practical and local** (route labels, endpoint markers, quick intent notes).
  - Consistency: present in most major files, sparse in simple models.

```js
// GET /api/student/projects
// Student applies to a teacher's project
```

- **Logging is ad-hoc** with `console.log` / `console.error`.
  - Inconsistent verbosity and style.

```js
console.log("hi");
console.error(error.stack);
console.error("EXPORT ERROR:", error);
```

---

## 12) Function and file size

- **Controller files are large and feature-packed** in domain hubs.
  - `teacher.control.js` 762 lines
  - `admin.control.js` 557 lines
  - `team.control.js` 361 lines
  - `log.control.js` 336 lines

- **Routes/models/middleware are much smaller.**
  - Routes: 10–57 lines
  - Models: 21–104 lines
  - Middleware: 22–52 lines

- **Function sizes vary widely:** compact CRUD handlers (~20–30 lines) and long orchestration handlers with transactions/populates.

---

## 13) Abstraction level

- **Low-to-moderate abstraction.**
  - Routes call controllers directly.
  - Controllers query models directly.
  - Small helper functions exist in-file (`generateTeamCode`, `ensureTeacherCanReviewLog`) and in utils (`handleGoogleAuth`, `uploadFile`).

```js
// direct coupling route -> controller
teacherRouter.post('/team-request',authTeacher,teamApprove);

// controller -> model direct
const teacher = await Teacher.findById(teacherId).session(session);
```

- **What is deliberately absent in current codebase**
  - No TypeScript files in `server/`.
  - No class-based controllers/services.
  - No dedicated `services/` layer.
  - No decorators.

---

## 14) Problem-decomposition habits

- **Feature decomposition by actor/domain** (student/teacher/admin/team/log/proposal/login-history).
- **Stateful workflows split across controller units** (e.g., team creation/join/approve/delete/request-supervisor are separate handlers but share status fields).
- **Cross-entity updates are grouped transactionally** for integrity-sensitive steps.

```js
// server/controllers/team.control.js
await Promise.all([team.save({ session }), student.save({ session })]);
await session.commitTransaction();
```

- **Access control is mostly decomposed into role middleware + ownership checks inside handler.**

```js
if (log.createdBy.toString() !== studentId) {
  return res.json({ success: false, message: "You are not allowed to edit this log" });
}
```

---

## 15) Language-independent principles (generalized)

- **[Consistent] API grouped by business actor/domain** (student, teacher, admin, team, log, proposal, history).
- **[Consistent] Request handlers are async functions with local error handling.**
- **[Consistent] Input guards are explicit near top of handlers/middleware.**
- **[Consistent] Domain workflows update multiple entities together and often use transactions.**
- **[Inconsistent] Unauthorized/error HTTP status semantics are mixed (sometimes explicit, sometimes implicit 200).**
- **[Inconsistent] Quote/spacing/formatting style is mixed.**
- **[Consistent] JWT-in-cookie auth is central pattern.**
- **[Inconsistent] Not all sensitive endpoints enforce auth middleware.**
- **[Consistent] Controllers interact with persistence directly (no repository/service layer).**
- **[Inconsistent] Model export/timestamp conventions are mostly but not fully standardized.**

---

## Inconsistencies

- Quote style: both `'` and `"` in same layer.
- Status code usage: `res.status(...).json(...)` vs bare `res.json(...)`.
- Auth coverage: some endpoints have no auth middleware while peers do.
- Model declaration style: guarded model export vs direct export.
- Timestamps: present in 6/8 models.

---

## Do-not list (things absent or mostly absent in current style)

- No TypeScript in `server/`.
- No class-based controllers/services.
- No dedicated service/repository layer.
- No request validation libraries (`joi`, `zod`, `express-validator`) in active server code.
- No centralized Express error-handler middleware.

---

## Unrelated findings (bugs/security/dead code; listed only)

- `proposal` routes import `authStudent` but do not apply it to upload/change/get endpoints.
- `teamRouter.post("/req-supervisor", requestSupervisor);` is unauthenticated.
- Several admin routes skip `authAdmin` (`/teacher-similarity/:teamId`, `/assign-supervisor`, `/teacher/:id/position`, `/export/:teamId`).
- `student.middleware.js` has malformed line combining `console.log(...)` and `const tokenDecode = ...` on one line.
- `team.model.js` defines `members` twice.
- `loginHistory.model.js` uses `ref: "Teacher"` while teacher model name is `"teacher"`.
- `admin.control.js` builds `teamData` but pushes `team` instead (likely dead/unapplied transform).
- `utils/upload.utils.js` appears unused by current routes/controllers.
- `utils/upload.utils.js` has parameter typo `f4ile` in fileFilter callback.

---

## Open questions for you

- Is unauthenticated access on proposal/team supervisor request/admin utility endpoints intentional or incomplete?
- Should status-code style be standardized to explicit HTTP statuses, or is `res.json` default-200 style intentional?
- Should model registration pattern be unified (`mongoose.models... ||`) for all models?
- Is `utils/upload.utils.js` intentionally legacy/unused, or should it remain part of active style references?
