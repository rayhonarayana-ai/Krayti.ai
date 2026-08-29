/** Gate 07C.15 static proof: migration is additive, zero-publication, and prepares a transactional boundary. */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PRODUCTION_PUBLISHABLE_CANDIDATES, PRODUCTION_PUBLICATION_MANIFESTS } from '../../../domain/constants/moroccan-primary-publication-manifest-registry';
import { ACTIVE_PUBLISHED_CURRICULUM, PRODUCTION_CURRICULUM_RELEASES } from '../../../domain/constants/moroccan-primary-publication-release-registry';

const migration = readFileSync(fileURLToPath(new URL('../../../../supabase/migrations/20260830_gate07c15_publication_governance.sql', import.meta.url)), 'utf8');
let passed = 0; let failed = 0;
function test(name: string, fn: () => void) { try { fn(); passed++; console.log(`[PASS] ${name}`); } catch (error: any) { failed++; console.log(`[FAIL] ${name}: ${error.message}`); } }
function has(expression: RegExp) { assert.ok(expression.test(migration), `Missing ${expression}`); }

test('A01-A06 - 07C.14 production truth remains zero', () => {
  assert.strictEqual(PRODUCTION_PUBLISHABLE_CANDIDATES.length, 0); assert.strictEqual(PRODUCTION_PUBLICATION_MANIFESTS.length, 0);
  assert.strictEqual(PRODUCTION_CURRICULUM_RELEASES.length, 0); assert.strictEqual(ACTIVE_PUBLISHED_CURRICULUM.length, 0);
});
test('B01-B11 - required governance entity set exists', () => {
  for (const table of ['curriculum_publication_manifests', 'curriculum_publication_manifest_entries', 'curriculum_publication_releases', 'curriculum_publication_events', 'curriculum_publication_authorizations', 'curriculum_publication_idempotency_keys', 'curriculum_publication_withdrawals', 'curriculum_publication_withdrawal_entries', 'curriculum_publication_supersessions', 'curriculum_publication_supersession_entries', 'curriculum_active_publication_entries']) has(new RegExp(`CREATE TABLE public\\.${table}`));
});
test('C01-C05 - events and sealed core records have SQL immutability guards', () => {
  has(/gate07c15_events_append_only BEFORE UPDATE OR DELETE/); has(/gate07c15_manifest_immutable BEFORE UPDATE OR DELETE/);
  has(/gate07c15_entry_immutable BEFORE UPDATE OR DELETE/); has(/gate07c15_release_immutable BEFORE UPDATE OR DELETE/);
  has(/sealed manifests cannot be deleted|sealed releases cannot be deleted/);
});
test('D01-F06 - manifest, snapshot bridge, and release bindings are complete', () => {
  for (const field of ['governance_code_commit', 'governance_package_digest', 'manifest_digest', 'entry_count', 'canonical_identity', 'claim_id', 'artifact_hash', 'verification_record_id', 'currentness_decision_id', 'readiness_decision_id', 'semantic_digest', 'provenance_digest', 'publication_policy_version', 'scope_key', 'release_version']) has(new RegExp(`\\b${field}\\b`));
  has(/Code-registry snapshot identifier, not a database foreign key/);
});
test('G01-H08 - authorizations and idempotency are release/digest/scope-bound and replay-safe', () => {
  for (const field of ['target_release_id', 'authority_snapshot', 'approved_at', 'expires_at', 'consumed_at', 'request_digest', 'idempotency_key', 'result_reference', 'finished_at']) has(new RegExp(`\\b${field}\\b`));
  has(/UNIQUE \(operation_type, idempotency_key\)/); has(/authorization consumption is immutable/);
});
test('I01-K07 - exact duplicate protection is honest about hierarchical runtime enforcement', () => {
  has(/UNIQUE \(canonical_identity, scope_key\)/); has(/UNIQUE \(release_id, scope_key\)/);
  has(/Hierarchical scope overlap requires future SERIALIZABLE trusted-command checks/); has(/predecessor_release_id UUID NOT NULL REFERENCES/);
  has(/curriculum_publication_withdrawal_entries/); has(/curriculum_publication_supersession_entries/);
});
test('L01-L11 - event union, aggregate sequence, and audit bindings are constrained', () => {
  for (const event of ['MANIFEST_CREATED', 'RELEASE_ACTIVATED', 'ENTRY_WITHDRAWN', 'CURRENTNESS_INVALIDATION_APPLIED', 'COMMAND_REJECTED']) assert.ok(migration.includes(`'${event}'`));
  has(/UNIQUE \(aggregate_type, aggregate_id, aggregate_sequence\)/); has(/occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp\(\)/);
});
test('M01-N05 - RLS is deny-by-default with only bounded active projection read', () => {
  assert.strictEqual((migration.match(/ENABLE ROW LEVEL SECURITY/g) ?? []).length, 11);
  has(/REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated/);
  has(/GRANT SELECT ON public\.curriculum_active_publication_entries TO authenticated/);
  assert.ok(!/GRANT (INSERT|UPDATE|DELETE).*curriculum_publication/i.test(migration));
  assert.ok(!/SERVICE_ROLE_KEY|user_metadata|CREATE OR REPLACE FUNCTION public\.(activate|withdraw|supersede)_publication/i.test(migration));
});
test('O01-R08 - activation contract is transactional and does not claim an implemented command', () => {
  has(/Future activation contract: SERIALIZABLE transaction/); has(/lock idempotency, authorization, release, manifest, and active scope/);
  has(/revalidate currentness\/verification invalidations/); has(/append audit event; update projection; consume authorization; commit atomically/);
  assert.ok(!/CREATE FUNCTION.*activate_publication_release/is.test(migration));
});
test('P01-Q08 - projection is rebuildable and reproducibility bindings are present', () => {
  has(/Rebuildable read model only/); has(/governance_code_commit/); has(/governance_package_digest/);
  for (const field of ['publication_policy_version', 'manifest_digest', 'artifact_hash', 'semantic_digest', 'provenance_digest', 'source_version_id']) has(new RegExp(`\\b${field}\\b`));
});
test('S01-S06 - migration has no destructive DDL or publication seed rows', () => {
  assert.ok(!/\bDROP\s+TABLE\b|\bDROP\s+COLUMN\b|\bTRUNCATE\b/i.test(migration));
  assert.ok(!/\bINSERT\s+INTO\s+public\.curriculum_(publication|active)/i.test(migration));
  assert.ok(!/\bDELETE\s+FROM\b/i.test(migration));
});
test('T01-X06 - static repository/deployment firewall holds', () => {
  assert.ok(!/supabase db push|supabase migration up|curl |fetch\(/i.test(migration));
  assert.ok(!/process\.env|OPENAI_API_KEY|SERVICE_ROLE_KEY/i.test(migration));
  assert.ok(migration.includes('not remotely applied by this gate'));
});

console.log(`\n--- GATE 07C.15: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);
process.exit(failed === 0 ? 0 : 1);
