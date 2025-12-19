-- ============================================
-- Vendor Claim System Migration
-- Purpose: Add claim requests table and handover logic
-- ============================================

-- 1. Create claim_requests table
CREATE TABLE IF NOT EXISTS public.claim_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    contact_email TEXT,
    contact_phone TEXT,
    message TEXT,
    documents JSONB DEFAULT '[]', -- Verification documents URLs
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Users can view own claim requests" ON public.claim_requests;
CREATE POLICY "Users can view own claim requests"
    ON public.claim_requests FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create claim requests" ON public.claim_requests;
CREATE POLICY "Users can create claim requests"
    ON public.claim_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all claim requests" ON public.claim_requests;
CREATE POLICY "Admins can manage all claim requests"
    ON public.claim_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 4. Handover & Approval RPC
CREATE OR REPLACE FUNCTION public.approve_vendor_claim(p_request_id UUID)
RETURNS VOID AS $$
DECLARE
    v_vendor_id UUID;
    v_user_id UUID;
BEGIN
    -- Get request details
    SELECT vendor_id, user_id INTO v_vendor_id, v_user_id
    FROM public.claim_requests
    WHERE id = p_request_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;

    -- 1. Update Vendor Ownership
    UPDATE public.vendors
    SET 
        user_id = v_user_id,
        is_claimed = true,
        claim_approved_at = NOW()
    WHERE id = v_vendor_id;

    -- 2. Ensure User Profile Role is 'vendor'
    UPDATE public.profiles
    SET role = 'vendor'
    WHERE id = v_user_id AND role != 'admin'; -- Don't downgrade admins

    -- 3. Ensure vendor_profiles entry exists (for credit system)
    INSERT INTO public.vendor_profiles (user_id)
    VALUES (v_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Mark request as approved
    UPDATE public.claim_requests
    SET status = 'approved', updated_at = NOW()
    WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Rejection RPC
CREATE OR REPLACE FUNCTION public.reject_vendor_claim(p_request_id UUID, p_notes TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.claim_requests
    SET 
        status = 'rejected',
        admin_notes = p_notes,
        updated_at = NOW()
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_claim_requests_vendor ON public.claim_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_user ON public.claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON public.claim_requests(status);
