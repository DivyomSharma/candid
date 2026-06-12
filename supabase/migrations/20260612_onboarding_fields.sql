-- Add Onboarding State to Candor Profiles

ALTER TABLE public.candor_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS identity_choices jsonb DEFAULT '{}'::jsonb;

-- Ensure existing users are not forced through onboarding immediately
-- (We assume existing users have already been using the app)
UPDATE public.candor_profiles
SET onboarding_completed = true
WHERE onboarding_completed IS false AND display_name IS NOT NULL;
