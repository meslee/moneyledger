-- Backfill profiles for existing users who don't have a profile yet
-- Default values: Language = 'en' (English), Currency = 'AUD' (Australian Dollar), Date Format = 'dd/MM/yyyy'

INSERT INTO public.profiles (id, language, currency, date_format, updated_at)
SELECT 
    id, 
    'en', 
    'AUD', 
    'dd/MM/yyyy', 
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
