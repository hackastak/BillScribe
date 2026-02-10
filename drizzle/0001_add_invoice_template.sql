CREATE TYPE "public"."invoice_template" AS ENUM('classic', 'simple', 'modern', 'professional', 'creative');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "invoice_template" "invoice_template" DEFAULT 'classic';
