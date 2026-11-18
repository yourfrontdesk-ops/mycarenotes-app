/*
  # Revoke public execute on handle_new_user_credit

  This function is a trigger function called internally by Postgres on new user
  signup. It should never be callable directly via the REST API by anon or
  authenticated roles.

  Changes:
  - Revoke EXECUTE on handle_new_user_credit() from anon role
  - Revoke EXECUTE on handle_new_user_credit() from authenticated role
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user_credit() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credit() FROM authenticated;
