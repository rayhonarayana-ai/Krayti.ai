-- Qarayti.ai - Gate 07C.15: persistent publication governance (not remotely applied by this gate).
-- Immutable snapshots bridge code-registry identifiers; they are intentionally not foreign keys.
-- Active projection is rebuildable from sealed manifests, entries, events, withdrawals, and supersessions.
-- Hierarchical scope overlap requires future SERIALIZABLE trusted-command checks; scope_key only constrains exact duplicates.

CREATE TABLE public.curriculum_publication_manifests (
  manifest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_version TEXT NOT NULL,
  publication_policy_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  created_by UUID REFERENCES auth.users(id),
  governance_code_commit TEXT NOT NULL,
  governance_package_digest TEXT NOT NULL CHECK (governance_package_digest ~ '^[0-9a-f]{64}$'),
  manifest_digest TEXT NOT NULL CHECK (manifest_digest ~ '^[0-9a-f]{64}$'),
  entry_count INTEGER NOT NULL CHECK (entry_count > 0),
  sealed_at TIMESTAMPTZ,
  cached_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (cached_status IN ('DRAFT', 'VALIDATED', 'SEALED', 'REJECTED')),
  UNIQUE (manifest_version, manifest_digest)
);

CREATE TABLE public.curriculum_publication_manifest_entries (
  manifest_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID NOT NULL REFERENCES public.curriculum_publication_manifests(manifest_id),
  canonical_identity TEXT NOT NULL,
  claim_id TEXT NOT NULL, -- Code-registry snapshot identifier, not a database foreign key.
  source_id TEXT NOT NULL,
  source_version_id TEXT NOT NULL,
  artifact_hash TEXT NOT NULL CHECK (artifact_hash ~ '^[0-9a-f]{64}$'),
  verification_record_id TEXT NOT NULL,
  verification_version TEXT NOT NULL,
  currentness_decision_id TEXT NOT NULL,
  currentness_as_of TIMESTAMPTZ NOT NULL,
  currentness_state TEXT NOT NULL CHECK (currentness_state IN ('CURRENT_CONFIRMED', 'CURRENT_FOR_SCOPE', 'CURRENTNESS_UNRESOLVED', 'SUPERSEDED_IN_SCOPE')),
  readiness_decision_id TEXT NOT NULL,
  readiness_state TEXT NOT NULL CHECK (readiness_state IN ('READY', 'REVIEW_REQUIRED', 'BLOCKED')),
  semantic_identity TEXT NOT NULL,
  semantic_digest TEXT NOT NULL CHECK (semantic_digest ~ '^[0-9a-f]{64}$'),
  provenance_digest TEXT NOT NULL CHECK (provenance_digest ~ '^[0-9a-f]{64}$'),
  publication_policy_version TEXT NOT NULL,
  education_system_id UUID NOT NULL REFERENCES public.curriculum_education_systems(id),
  education_level TEXT,
  subject_id UUID REFERENCES public.curriculum_subjects(id),
  grade_scope TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (manifest_id, canonical_identity, scope_key),
  UNIQUE (manifest_id, manifest_entry_id)
);

CREATE TABLE public.curriculum_publication_releases (
  release_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_version TEXT NOT NULL,
  manifest_id UUID NOT NULL REFERENCES public.curriculum_publication_manifests(manifest_id),
  manifest_digest TEXT NOT NULL CHECK (manifest_digest ~ '^[0-9a-f]{64}$'),
  publication_policy_version TEXT NOT NULL,
  education_system_id UUID NOT NULL REFERENCES public.curriculum_education_systems(id),
  education_level TEXT,
  subject_id UUID REFERENCES public.curriculum_subjects(id),
  grade_scope TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  sealed_at TIMESTAMPTZ,
  cached_lifecycle_state TEXT NOT NULL DEFAULT 'DRAFT' CHECK (cached_lifecycle_state IN ('DRAFT', 'VALIDATED', 'SEALED', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN', 'REJECTED')),
  UNIQUE (release_version, manifest_id)
);

CREATE TABLE public.curriculum_publication_authorizations (
  authorization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL CHECK (operation IN ('PUBLICATION_MANIFEST_CREATE', 'PUBLICATION_MANIFEST_VALIDATE', 'PUBLICATION_RELEASE_SEAL', 'PUBLICATION_RELEASE_ACTIVATE', 'PUBLICATION_WITHDRAW', 'PUBLICATION_SUPERSEDE', 'PUBLICATION_AUDIT_READ', 'PUBLICATION_ACTIVE_READ')),
  target_release_id UUID REFERENCES public.curriculum_publication_releases(release_id),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id),
  authority_snapshot TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ,
  reason_code TEXT NOT NULL,
  publication_policy_version TEXT NOT NULL,
  request_digest TEXT NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  manifest_digest TEXT NOT NULL CHECK (manifest_digest ~ '^[0-9a-f]{64}$'),
  scope_key TEXT NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK (expires_at IS NULL OR expires_at > approved_at)
);

CREATE TABLE public.curriculum_publication_idempotency_keys (
  idempotency_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_digest TEXT NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_reference TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'REJECTED')),
  result_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  finished_at TIMESTAMPTZ,
  UNIQUE (operation_type, idempotency_key)
);

CREATE TABLE public.curriculum_publication_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('MANIFEST_CREATED', 'MANIFEST_VALIDATED', 'MANIFEST_REJECTED', 'RELEASE_CREATED', 'RELEASE_SEALED', 'ACTIVATION_AUTHORIZED', 'RELEASE_ACTIVATED', 'RELEASE_SUPERSEDED', 'ENTRY_SUPERSEDED', 'ENTRY_WITHDRAWN', 'RELEASE_WITHDRAWN', 'VERIFICATION_INVALIDATION_APPLIED', 'CURRENTNESS_INVALIDATION_APPLIED', 'COMMAND_REPLAYED', 'COMMAND_REJECTED')),
  aggregate_type TEXT NOT NULL CHECK (aggregate_type IN ('MANIFEST', 'RELEASE', 'AUTHORIZATION', 'WITHDRAWAL', 'SUPERSESSION')),
  aggregate_id UUID NOT NULL,
  release_id UUID REFERENCES public.curriculum_publication_releases(release_id),
  manifest_id UUID REFERENCES public.curriculum_publication_manifests(manifest_id),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id),
  authority_snapshot TEXT NOT NULL,
  authorization_id UUID REFERENCES public.curriculum_publication_authorizations(authorization_id),
  idempotency_key TEXT,
  request_digest TEXT NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  publication_policy_version TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  reason_code TEXT,
  reason_text TEXT,
  metadata_digest TEXT NOT NULL CHECK (metadata_digest ~ '^[0-9a-f]{64}$'),
  aggregate_sequence BIGINT NOT NULL CHECK (aggregate_sequence > 0),
  UNIQUE (aggregate_type, aggregate_id, aggregate_sequence)
);

CREATE TABLE public.curriculum_publication_withdrawals (
  withdrawal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_release_id UUID NOT NULL REFERENCES public.curriculum_publication_releases(release_id),
  authorization_id UUID REFERENCES public.curriculum_publication_authorizations(authorization_id),
  scope_key TEXT NOT NULL,
  reason_code TEXT NOT NULL CHECK (reason_code IN ('SOURCE_SUPERSEDED', 'CURRENTNESS_INVALIDATED', 'VERIFICATION_REOPENED', 'CLAIM_REJECTED', 'PROVENANCE_INVALIDATED', 'EDITORIAL_ERROR', 'LEGAL_OR_POLICY_BLOCK', 'DUPLICATE_CANONICAL_IDENTITY', 'OTHER_REVIEW_REQUIRED', 'EMERGENCY_SAFETY_WITHDRAWAL')),
  reason_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE public.curriculum_publication_withdrawal_entries (
  withdrawal_id UUID NOT NULL REFERENCES public.curriculum_publication_withdrawals(withdrawal_id),
  manifest_id UUID NOT NULL,
  manifest_entry_id UUID NOT NULL,
  PRIMARY KEY (withdrawal_id, manifest_entry_id),
  FOREIGN KEY (manifest_id, manifest_entry_id) REFERENCES public.curriculum_publication_manifest_entries(manifest_id, manifest_entry_id)
);

CREATE TABLE public.curriculum_publication_supersessions (
  supersession_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_release_id UUID NOT NULL REFERENCES public.curriculum_publication_releases(release_id),
  successor_release_id UUID NOT NULL REFERENCES public.curriculum_publication_releases(release_id),
  authorization_id UUID REFERENCES public.curriculum_publication_authorizations(authorization_id),
  scope_key TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  CHECK (predecessor_release_id <> successor_release_id)
);

CREATE TABLE public.curriculum_publication_supersession_entries (
  supersession_id UUID NOT NULL REFERENCES public.curriculum_publication_supersessions(supersession_id),
  predecessor_manifest_id UUID NOT NULL,
  predecessor_manifest_entry_id UUID NOT NULL,
  canonical_identity TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  PRIMARY KEY (supersession_id, predecessor_manifest_entry_id),
  FOREIGN KEY (predecessor_manifest_id, predecessor_manifest_entry_id) REFERENCES public.curriculum_publication_manifest_entries(manifest_id, manifest_entry_id)
);

-- Rebuildable read model only. Future trusted SERIALIZABLE commands maintain this atomically with events.
CREATE TABLE public.curriculum_active_publication_entries (
  active_publication_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.curriculum_publication_releases(release_id),
  manifest_id UUID NOT NULL,
  manifest_entry_id UUID NOT NULL,
  canonical_identity TEXT NOT NULL,
  education_system_id UUID NOT NULL REFERENCES public.curriculum_education_systems(id),
  education_level TEXT,
  subject_id UUID REFERENCES public.curriculum_subjects(id),
  grade_scope TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  semantic_digest TEXT NOT NULL CHECK (semantic_digest ~ '^[0-9a-f]{64}$'),
  provenance_digest TEXT NOT NULL CHECK (provenance_digest ~ '^[0-9a-f]{64}$'),
  activation_state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (activation_state = 'ACTIVE'),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (manifest_id, manifest_entry_id) REFERENCES public.curriculum_publication_manifest_entries(manifest_id, manifest_entry_id),
  UNIQUE (canonical_identity, scope_key),
  UNIQUE (release_id, scope_key)
);

CREATE OR REPLACE FUNCTION public.gate07c15_reject_event_mutation() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN RAISE EXCEPTION 'curriculum publication events are append-only'; END;
$$;

CREATE OR REPLACE FUNCTION public.gate07c15_guard_manifest() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.sealed_at IS NOT NULL THEN RAISE EXCEPTION 'sealed manifests cannot be deleted'; END IF;
  IF TG_OP = 'UPDATE' AND OLD.sealed_at IS NOT NULL AND (NEW.manifest_id, NEW.manifest_version, NEW.publication_policy_version, NEW.governance_code_commit, NEW.governance_package_digest, NEW.manifest_digest, NEW.entry_count) IS DISTINCT FROM (OLD.manifest_id, OLD.manifest_version, OLD.publication_policy_version, OLD.governance_code_commit, OLD.governance_package_digest, OLD.manifest_digest, OLD.entry_count) THEN RAISE EXCEPTION 'sealed manifest binding is immutable'; END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.gate07c15_guard_sealed_entry() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.curriculum_publication_manifests WHERE manifest_id = OLD.manifest_id AND sealed_at IS NOT NULL) THEN RAISE EXCEPTION 'entries of sealed manifests are immutable'; END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.gate07c15_guard_release() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.sealed_at IS NOT NULL THEN RAISE EXCEPTION 'sealed releases cannot be deleted'; END IF;
  IF TG_OP = 'UPDATE' AND OLD.sealed_at IS NOT NULL AND (NEW.release_id, NEW.release_version, NEW.manifest_id, NEW.manifest_digest, NEW.publication_policy_version, NEW.education_system_id, NEW.education_level, NEW.subject_id, NEW.grade_scope, NEW.scope_key) IS DISTINCT FROM (OLD.release_id, OLD.release_version, OLD.manifest_id, OLD.manifest_digest, OLD.publication_policy_version, OLD.education_system_id, OLD.education_level, OLD.subject_id, OLD.grade_scope, OLD.scope_key) THEN RAISE EXCEPTION 'sealed release binding is immutable'; END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.gate07c15_guard_authorization() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'publication authorizations are retained'; END IF;
  IF TG_OP = 'UPDATE' AND (NEW.authorization_id, NEW.operation, NEW.target_release_id, NEW.actor_user_id, NEW.authority_snapshot, NEW.decision, NEW.approved_at, NEW.expires_at, NEW.reason_code, NEW.publication_policy_version, NEW.request_digest, NEW.manifest_digest, NEW.scope_key) IS DISTINCT FROM (OLD.authorization_id, OLD.operation, OLD.target_release_id, OLD.actor_user_id, OLD.authority_snapshot, OLD.decision, OLD.approved_at, OLD.expires_at, OLD.reason_code, OLD.publication_policy_version, OLD.request_digest, OLD.manifest_digest, OLD.scope_key) THEN RAISE EXCEPTION 'authorization binding is immutable'; END IF;
  IF TG_OP = 'UPDATE' AND OLD.consumed_at IS NOT NULL AND NEW.consumed_at IS DISTINCT FROM OLD.consumed_at THEN RAISE EXCEPTION 'authorization consumption is immutable'; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER gate07c15_events_append_only BEFORE UPDATE OR DELETE ON public.curriculum_publication_events FOR EACH ROW EXECUTE FUNCTION public.gate07c15_reject_event_mutation();
CREATE TRIGGER gate07c15_manifest_immutable BEFORE UPDATE OR DELETE ON public.curriculum_publication_manifests FOR EACH ROW EXECUTE FUNCTION public.gate07c15_guard_manifest();
CREATE TRIGGER gate07c15_entry_immutable BEFORE UPDATE OR DELETE ON public.curriculum_publication_manifest_entries FOR EACH ROW EXECUTE FUNCTION public.gate07c15_guard_sealed_entry();
CREATE TRIGGER gate07c15_release_immutable BEFORE UPDATE OR DELETE ON public.curriculum_publication_releases FOR EACH ROW EXECUTE FUNCTION public.gate07c15_guard_release();
CREATE TRIGGER gate07c15_authorization_immutable BEFORE UPDATE OR DELETE ON public.curriculum_publication_authorizations FOR EACH ROW EXECUTE FUNCTION public.gate07c15_guard_authorization();

ALTER TABLE public.curriculum_publication_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_manifest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_withdrawal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_supersessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publication_supersession_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_active_publication_entries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON public.curriculum_active_publication_entries TO authenticated;
CREATE POLICY "authenticated read active publication projection" ON public.curriculum_active_publication_entries FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_publication_events_aggregate_time ON public.curriculum_publication_events(aggregate_type, aggregate_id, occurred_at);
CREATE INDEX idx_publication_entries_manifest ON public.curriculum_publication_manifest_entries(manifest_id);
CREATE INDEX idx_publication_active_scope ON public.curriculum_active_publication_entries(education_system_id, subject_id, scope_key);

-- Future activation contract: SERIALIZABLE transaction; lock idempotency, authorization, release, manifest, and active scope;
-- revalidate currentness/verification invalidations; append audit event; update projection; consume authorization; commit atomically.
