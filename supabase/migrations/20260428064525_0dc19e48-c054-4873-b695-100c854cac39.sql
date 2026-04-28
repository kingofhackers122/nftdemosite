ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS nowpayments_payment_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS transactions_provider_payment_id_uniq
  ON public.transactions (payment_provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.admin_confirm_deposit(_tx_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tx RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT * INTO tx FROM public.transactions WHERE id = _tx_id FOR UPDATE;
  IF tx IS NULL THEN RAISE EXCEPTION 'tx not found'; END IF;
  IF tx.type <> 'deposit' OR tx.status <> 'pending' THEN
    RAISE EXCEPTION 'tx not a pending deposit';
  END IF;
  UPDATE public.profiles SET balance_eth = balance_eth + tx.amount_eth WHERE id = tx.user_id;
  UPDATE public.transactions SET status = 'confirmed', updated_at = now() WHERE id = _tx_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_transaction(_tx_id uuid, _reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tx RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT * INTO tx FROM public.transactions WHERE id = _tx_id FOR UPDATE;
  IF tx IS NULL THEN RAISE EXCEPTION 'tx not found'; END IF;
  IF tx.status <> 'pending' THEN RAISE EXCEPTION 'tx not pending'; END IF;
  -- refund withdrawal balance (we already deducted on request)
  IF tx.type = 'withdrawal' THEN
    UPDATE public.profiles SET balance_eth = balance_eth + tx.amount_eth WHERE id = tx.user_id;
  END IF;
  UPDATE public.transactions
    SET status = 'failed', updated_at = now(),
        notes = COALESCE(notes, '') || ' | rejected: ' || COALESCE(_reason, '')
    WHERE id = _tx_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mark_withdrawal_paid(_tx_id uuid, _hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tx RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT * INTO tx FROM public.transactions WHERE id = _tx_id;
  IF tx IS NULL THEN RAISE EXCEPTION 'tx not found'; END IF;
  IF tx.type <> 'withdrawal' OR tx.status <> 'pending' THEN
    RAISE EXCEPTION 'tx not a pending withdrawal';
  END IF;
  UPDATE public.transactions
    SET status = 'confirmed', tx_hash = _hash, updated_at = now()
    WHERE id = _tx_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_confirm_deposit(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reject_transaction(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_mark_withdrawal_paid(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_confirm_deposit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_transaction(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_withdrawal_paid(uuid, text) TO authenticated;