# Backend Routes Report

This report provides a detailed overview of the available backend routes in the Gym application, including their descriptions and input requirements.

---

## 🔐 User Authentication (`/v1/auth`)
*Base Tag: User Authentication*

| Method | Path | Description | Input Requirements |
|:---|:---|:---|:---|
| `POST` | `/register` | Register a new user account. | `email`, `password`, `full_name` (optional), `role` (optional) |
| `POST` | `/verify` | Verify user email with a verification code. | `email`, `verification_code` |
| `POST` | `/resend_verification_code` | Resend the verification code to the user's email. | `email` |
| `POST` | `/login` | Authenticate user and return access token. | `email`, `password`, `remember_me` (optional) |
| `POST` | `/forgot-password` | Send a password reset link to the user's email. | `email` |
| `POST` | `/reset-password` | Reset password using a valid reset token. | `token`, `new_password` (min 6 chars) |
| `POST` | `/change-password` | Change password for the currently authenticated user. | `old_password`, `new_password` |
| `GET` | `/auth/me` | Retrieve information about the current authenticated user. | Bearer Token |
| `POST` | `/logout` | Invalidate the current session and logout. | Bearer Token |
| `POST` | `/refresh` | Refresh the access token. | Bearer Token |

---

## 👤 User Management (`/v1/users`)
*Base Tag: Users*

| Method | Path | Description | Input Requirements |
|:---|:---|:---|:---|
| `GET` | `/me` | Get basic user account data. | Bearer Token |
| `PATCH` | `/me` | Update basic user account information. | `email`, `full_name`, `membership_status`, `theme` (all optional) |
| `DELETE` | `/me` | Permanently delete the user account. | Bearer Token |
| `GET` | `/me/profile` | Retrieve the detailed user profile. | Bearer Token |
| `POST` | `/me/profile` | Create a user profile (one-time setup). | `date_of_birth`, `gender`, `height_cm`, `weight_kg`, `fitness_level`, `primary_goal`, `experience_months` |
| `PATCH` | `/me/profile` | Update user profile details. | `date_of_birth`, `gender`, `height_cm`, `weight_kg`, `fitness_level`, `primary_goal`, `experience_months` (all optional) |
| `GET` | `/me/body-metrics` | Get user's body measurement history. | Bearer Token |
| `POST` | `/me/body-metrics` | Record new body measurements. | `measurement_date`, `body_fat_pct`, `muscle_mass_kg`, `chest_cm`, `waist_cm`, `hips_cm`, `notes` |
| `PATCH` | `/me/body-metrics` | Update an existing body measurement record. | `body_fat_pct`, `muscle_mass_kg`, `chest_cm`, `waist_cm`, `hips_cm`, `notes` (all optional) |

---

## 🏋️ Exercise (`/v1/exercise`)
*Base Tag: Exercise*

| Method | Path | Description | Input Requirements |
|:---|:---|:---|:---|
| `GET` | `/get` | Get detailed information for a specific exercise. | `exercise_id` (Query UUID) |
| `GET` | `/all` | Retrieve a list of all available exercises in the database. | Bearer Token |

---

## 📊 Insights (`/v1/insights`)
*Base Tag: Insights*

| Method | Path | Description | Input Requirements |
|:---|:---|:---|:---|
| `GET` | `/overview` | Get workout insights, strength progress, and AI recommendations. | `days` (Optional int, default 7) |

---

## ⏱️ Sessions (`/v1/session`)
*Base Tag: Sessions*

| Method | Path | Description | Input Requirements |
|:---|:---|:---|:---|
| `GET` | `/active` | Get the list of exercises for the current active session. | Bearer Token |
| `GET` | `/start` | Initialize a new workout session for the active plan. | Bearer Token |
| `POST` | `/complete` | Finalize a workout session with feedback. | `session_id` (UUID), `status`, `energy_level`, `mood`, `notes` |
| `POST` | `/{session_id}/{order_id}/start` | Mark a specific exercise as started within a session. | `session_id` (UUID), `order_id` (int) |
| `POST` | `/{exercise_session_id}/complete_feedback` | Submit feedback and results for a specific exercise. | `exercise_session_id` (UUID), `feedback_type`, `workout_sets`, `workout_reps`, `workout_weight`, `workout_time` |

---

## 📋 Workout Templates (`/v1/templates`)
*Base Tag: Templates*

| Method | Path | Description | Input Requirements |
|:---|:---|:---|:---|
| `GET` | `/` | List available workout templates with filtering. | `skip`, `limit`, `difficulty`, `workout_type` (all optional) |
| `GET` | `/{template_id}` | Get a specific template with all associated exercises. | `template_id` (UUID) |
| `POST` | `/` | Create a new workout template (Admin only). | `name`, `description`, `difficulty_level`, `estimated_duration_minutes`, `target_muscle_groups`, `workout_type` |
| `PATCH` | `/{template_id}` | Update an existing workout template (Admin only). | `template_id` (UUID), template update fields |
| `DELETE` | `/templates` | Delete a workout template (Note: path is `/templates`). | `template_id` (Query UUID) |

---

## 💪 Workouts (`/v1/workout`)
*Base Tag: Workouts*

| Method | Path | Description | Input Requirements |
|:---|:---|:---|:---|
| `GET` | `/get_all` | Get all workout plans created or selected by the user. | Bearer Token |
| `GET` | `/active` | Retrieve the user's currently active workout plan. | Bearer Token |
| `POST` | `/{workout_id}/activate` | Activate a specific workout plan for the user. | `workout_id` (UUID) |
| `POST` | `/{workout_id}/deactivate` | Deactivate a specific workout plan. | `workout_id` (UUID) |
| `POST` | `/temp` | Create a user workout plan from an existing template. | `template_id` (Query UUID) |
| `POST` | `/generate` | Generate a new workout plan using AI/ML. | Bearer Token |
| `POST` | `/user` | Create a fully custom workout plan with exercises. | `name`, `description`, `difficulty_level`, `workout_type`, `exercises` (List) |
| `GET` | `/{workout_id}` | Get details of a specific user workout plan. | `workout_id` (UUID) |
| `PUT` | `/{workout_id}` | Update a user workout plan's metadata. | `workout_id` (UUID), `name`, `status`, `end_date`, `is_regular` |
| `DELETE` | `/{workout_id}` | Delete a user workout plan. | `workout_id` (UUID) |
| `GET` | `/{workout_id}/exercise` | Get the list of exercises in a specific workout plan. | `workout_id` (UUID) |
| `PATCH` | `/{workout_id}/exercise` | Update several exercises in a workout plan at once. | `workout_id` (UUID), `exercise_update` (List) |
| `PATCH` | `/{workout_id}/exercise/{exercise_id}` | Update sets, reps, or weight for a specific exercise. | `workout_id`, `exercise_id`, `sets`, `reps`, `weight`, `rest_seconds` |
