-- Enforce single-row tables at the database level.
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_id_check" CHECK ("id" = 1);
ALTER TABLE "welcome_banner" ADD CONSTRAINT "welcome_banner_id_check" CHECK ("id" = 1);
