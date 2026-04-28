ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS upload_fee_eth NUMERIC NOT NULL DEFAULT 0.001;

-- Function to charge upload fee atomically
CREATE OR REPLACE FUNCTION public.charge_upload_fee(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fee NUMERIC;
  bal NUMERIC;
BEGIN
  SELECT upload_fee_eth INTO fee FROM public.site_settings WHERE id = 1;
  IF fee IS NULL THEN fee := 0; END IF;

  SELECT balance_eth INTO bal FROM public.profiles WHERE id = _user_id FOR UPDATE;
  IF bal IS NULL OR bal < fee THEN
    RETURN false;
  END IF;

  UPDATE public.profiles SET balance_eth = balance_eth - fee WHERE id = _user_id;
  INSERT INTO public.transactions (user_id, type, status, amount_eth, notes)
  VALUES (_user_id, 'fee', 'confirmed', fee, 'NFT upload fee');
  RETURN true;
END;
$$;

-- Function for user to request a withdrawal (creates pending tx, deducts balance)
CREATE OR REPLACE FUNCTION public.request_withdrawal(_amount numeric, _wallet text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  bal NUMERIC;
  minw NUMERIC;
  tx_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  SELECT min_withdrawal_eth INTO minw FROM public.site_settings WHERE id = 1;
  IF _amount < COALESCE(minw, 0.01) THEN RAISE EXCEPTION 'Below minimum withdrawal'; END IF;

  SELECT balance_eth INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal < _amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  UPDATE public.profiles SET balance_eth = balance_eth - _amount WHERE id = uid;
  INSERT INTO public.transactions (user_id, type, status, amount_eth, notes)
  VALUES (uid, 'withdrawal', 'pending', _amount, 'To wallet: ' || _wallet)
  RETURNING id INTO tx_id;
  RETURN tx_id;
END;
$$;

-- Function to record manual ETH deposit (pending until admin confirms)
CREATE OR REPLACE FUNCTION public.request_deposit(_amount numeric, _tx_hash text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  tx_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  INSERT INTO public.transactions (user_id, type, status, amount_eth, tx_hash, notes, payment_provider)
  VALUES (uid, 'deposit', 'pending', _amount, _tx_hash, 'Manual ETH deposit', 'manual')
  RETURNING id INTO tx_id;
  RETURN tx_id;
END;
$$;