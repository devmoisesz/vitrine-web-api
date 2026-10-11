-- Incremental migration: existing stores and their records remain untouched.
CREATE TABLE "segment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "segment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "segment_name_key" ON "segment"("name");
CREATE UNIQUE INDEX "segment_slug_key" ON "segment"("slug");
-- Enforce case-insensitive name uniqueness even for concurrent requests.
CREATE UNIQUE INDEX "segment_name_lower_key" ON "segment"(LOWER("name"));

CREATE TABLE "store_segments" (
    "store_id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    CONSTRAINT "store_segments_pkey" PRIMARY KEY ("store_id", "segment_id")
);

CREATE INDEX "store_segments_segment_id_idx" ON "store_segments"("segment_id");
ALTER TABLE "store_segments" ADD CONSTRAINT "store_segments_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_segments" ADD CONSTRAINT "store_segments_segment_id_fkey"
    FOREIGN KEY ("segment_id") REFERENCES "segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
