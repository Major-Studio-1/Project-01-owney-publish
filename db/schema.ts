import { integer, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";
export const visitorTags = sqliteTable("visitor_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: text("submission_id").notNull(),
  city: text("city").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at").notNull(),
  requesterHash: text("requester_hash").notNull(),
}, table => [
  uniqueIndex("idx_visitor_tags_submission_id").on(table.submissionId),
  index("idx_visitor_tags_requester_time").on(table.requesterHash, table.createdAt),
]);
