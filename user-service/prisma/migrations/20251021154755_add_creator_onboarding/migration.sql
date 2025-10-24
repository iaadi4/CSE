-- CreateTable
CREATE TABLE "public"."creator_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "category" TEXT,
    "country" TEXT,
    "website" TEXT,
    "avatar_url" TEXT,
    "banner_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creator_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'pending_submission',
    "rejection_reason" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "creator_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creator_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creator_social_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_user_id_key" ON "public"."creator_profiles"("user_id");

-- CreateIndex
CREATE INDEX "creator_profiles_user_id_idx" ON "public"."creator_profiles"("user_id");

-- CreateIndex
CREATE INDEX "creator_applications_user_id_idx" ON "public"."creator_applications"("user_id");

-- CreateIndex
CREATE INDEX "creator_applications_state_idx" ON "public"."creator_applications"("state");

-- CreateIndex
CREATE INDEX "creator_documents_user_id_idx" ON "public"."creator_documents"("user_id");

-- CreateIndex
CREATE INDEX "creator_documents_status_idx" ON "public"."creator_documents"("status");

-- CreateIndex
CREATE INDEX "creator_social_links_user_id_idx" ON "public"."creator_social_links"("user_id");

-- CreateIndex
CREATE INDEX "verification_logs_user_id_idx" ON "public"."verification_logs"("user_id");

-- CreateIndex
CREATE INDEX "verification_logs_created_at_idx" ON "public"."verification_logs"("created_at");

-- AddForeignKey
ALTER TABLE "public"."creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creator_applications" ADD CONSTRAINT "creator_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creator_documents" ADD CONSTRAINT "creator_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creator_social_links" ADD CONSTRAINT "creator_social_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verification_logs" ADD CONSTRAINT "verification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
