REVOKE ALL ON FUNCTION public.charge_upload_fee(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_withdrawal(numeric, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.request_deposit(numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_deposit(numeric, text) TO authenticated;