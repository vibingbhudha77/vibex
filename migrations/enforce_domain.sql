-- Migration: Enforce IITGN Domain
-- Description: Adds a trigger to auth.users to ensure only emails ending in @iitgn.ac.in can sign up.

-- 1. Create the function to check the email domain
CREATE OR REPLACE FUNCTION public.check_iitgn_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email ends with @iitgn.ac.in (case-insensitive)
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@iitgn\.ac\.in$' THEN
    RAISE EXCEPTION 'Only iitgn.ac.in emails are allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
-- Note: We need to drop it first if it exists to avoid errors on re-runs
DROP TRIGGER IF EXISTS enforce_iitgn_domain ON auth.users;

CREATE TRIGGER enforce_iitgn_domain
  BEFORE INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_iitgn_domain();

-- 3. Grant necessary permissions (optional, but good practice)
GRANT EXECUTE ON FUNCTION public.check_iitgn_domain() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_iitgn_domain() TO supabase_auth_admin;
