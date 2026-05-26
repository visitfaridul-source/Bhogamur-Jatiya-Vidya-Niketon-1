# AI Coding Style and Instructions

The following project-specific instructions guide development. Follow them strictly inside this workspace:

### 1. Proactive, Automatic Error Resolution
- **Always Auto-Fix**: If you discover any compile errors, linting issues, or potential background console warnings/errors, patch and fix them immediately. Do not ask for permissions or explain the plan. Execute the fix directly.
- **Silent & Clean Console**: Ensure that real-time database listener errors (e.g., Firestore onSnapshot permissions errors when a user is logged out, unauthenticated, or lacks specific access) are handled gracefully and silently. Suppress generic log warnings to keep the preview console clean and pristine for the user.

### 2. Component/Modal Portal Architecture
- Always ensure that components requiring `<AnimatePresence>` and `createPortal` have correct nesting. Ensure `createPortal` sits at the outer boundary or correctly wraps `<AnimatePresence>` so animations exit cleanly and do not crash on unmount.
- Provide sensible fallbacks for empty states (e.g., `|| ''` or safe nullish checks) across all forms and visual inputs, particularly in profile fields (Staff, Students, Teachers).
