-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.nft_status AS ENUM ('draft', 'on_sale', 'sold', 'unlisted');
CREATE TYPE public.tx_type AS ENUM ('deposit', 'withdrawal', 'purchase', 'sale', 'fee');
CREATE TYPE public.tx_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  wallet_address TEXT,
  balance_eth NUMERIC(20,8) NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

INSERT INTO public.categories (name, slug, display_order) VALUES
  ('Art', 'art', 1),
  ('Collectibles', 'collectibles', 2),
  ('Photography', 'photography', 3),
  ('Sports', 'sports', 4),
  ('Gaming', 'gaming', 5),
  ('Music', 'music', 6);

-- ============ NFTS ============
CREATE TABLE public.nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  collection_name TEXT,
  price_eth NUMERIC(20,8),
  status public.nft_status NOT NULL DEFAULT 'on_sale',
  view_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at TIMESTAMPTZ
);
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_nfts_creator ON public.nfts(creator_id);
CREATE INDEX idx_nfts_owner ON public.nfts(owner_id);
CREATE INDEX idx_nfts_status ON public.nfts(status);
CREATE INDEX idx_nfts_category ON public.nfts(category_id);

-- ============ TRANSACTIONS ============
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counterparty_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nft_id UUID REFERENCES public.nfts(id) ON DELETE SET NULL,
  type public.tx_type NOT NULL,
  status public.tx_status NOT NULL DEFAULT 'pending',
  amount_eth NUMERIC(20,8) NOT NULL,
  tx_hash TEXT,
  payment_provider TEXT,
  provider_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tx_user ON public.transactions(user_id);
CREATE INDEX idx_tx_status ON public.transactions(status);

-- ============ SITE SETTINGS (single row) ============
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'Mintograph',
  site_email TEXT,
  deposit_wallet_address TEXT,
  payment_mode TEXT NOT NULL DEFAULT 'manual',
  nowpayments_enabled BOOLEAN NOT NULL DEFAULT false,
  platform_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 2.5,
  min_withdrawal_eth NUMERIC(20,8) NOT NULL DEFAULT 0.01,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.site_settings (id) VALUES (1);

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- nfts
CREATE POLICY "NFTs are viewable by everyone" ON public.nfts FOR SELECT USING (true);
CREATE POLICY "Users create own NFTs" ON public.nfts FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id AND auth.uid() = owner_id);
CREATE POLICY "Owners update own NFTs" ON public.nfts FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins update any NFT" ON public.nfts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete own NFTs" ON public.nfts FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins delete any NFT" ON public.nfts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- transactions
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = counterparty_id);
CREATE POLICY "Admins view all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- site_settings
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER nfts_updated_at BEFORE UPDATE ON public.nfts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tx_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
BEGIN
  uname := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  -- ensure unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = uname) LOOP
    uname := uname || floor(random() * 1000)::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, uname, COALESCE(NEW.raw_user_meta_data->>'display_name', uname));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('nfts', 'nfts', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

CREATE POLICY "Public read nfts" ON storage.objects FOR SELECT USING (bucket_id = 'nfts');
CREATE POLICY "Auth upload nfts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'nfts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner update nfts" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'nfts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete nfts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'nfts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Auth upload banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner update banners" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete banners" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);