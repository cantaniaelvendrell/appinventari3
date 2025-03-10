DROP TABLE IF EXISTS public.users; CREATE TABLE public.users (id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ); ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; CREATE POLICY \
Permitir
todas
las
operaciones
a
usuarios
autenticados\ ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
