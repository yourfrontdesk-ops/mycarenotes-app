/*
  # Revoke PUBLIC execute on handle_new_user_credit

  The function handle_new_user_credit() is a trigger-only function and must
  never be callable directly via the REST API. The previous migration revoked
  execute from `anon` and `authenticated` explicitly, but Postgres still had
  the default EXECUTE grant on PUBLIC, which covers both those roles.

  Changes:
  - Revoke EXECUTE on handle_new_user_credit() from PUBLIC
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user_credit() FROM PUBLIC;
