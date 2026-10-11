export function database(env) {
  if (!env.DB?.prepare) throw new Error("Community database binding is unavailable");
  return env.DB;
}
export const publicColumns = 'id, city, message, created_at';
export async function getTag(env,id) {
  return database(env).prepare(`SELECT ${publicColumns} FROM visitor_tags WHERE id = ?`).bind(id).first();
}
export async function listTags(env, before) {
  const db = database(env);
  const query = before
    ? db.prepare(`SELECT ${publicColumns} FROM visitor_tags WHERE id < ? ORDER BY id DESC LIMIT 25`).bind(before)
    : db.prepare(`SELECT ${publicColumns} FROM visitor_tags ORDER BY id DESC LIMIT 25`);
  const {results} = await query.all();
  const tags = results.slice(0, 24);
  return { tags, next: results.length > 24 ? tags.at(-1).id : null };
}
export async function addTag(env, tag) {
  const db = database(env);
  const existing = await db.prepare(`SELECT ${publicColumns}, requester_hash FROM visitor_tags WHERE submission_id = ?`).bind(tag.submissionId).first();
  if (existing) {
    if (existing.city !== tag.city || existing.message !== tag.message || existing.requester_hash !== tag.requesterHash) return { conflict: true };
    const {requester_hash, ...publicTag} = existing;
    return {tag:publicTag, replay:true};
  }
  // The quota and insert are one atomic statement.
  const row = await db.prepare(`INSERT INTO visitor_tags (submission_id, city, message, created_at, requester_hash)
    SELECT ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM visitor_tags WHERE requester_hash = ? AND created_at > ?) < 3
    ON CONFLICT(submission_id) DO NOTHING RETURNING ${publicColumns}`)
    .bind(tag.submissionId,tag.city,tag.message,tag.createdAt,tag.requesterHash,tag.requesterHash,tag.createdAt-3600000).first();
  return row ? {tag:row} : {limited:true};
}
