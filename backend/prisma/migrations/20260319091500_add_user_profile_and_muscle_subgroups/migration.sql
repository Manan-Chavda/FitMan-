ALTER TABLE "User"
ADD COLUMN "training_years" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "bodyweight_kg" DOUBLE PRECISION NOT NULL DEFAULT 70,
ADD COLUMN "fatigue_resistance" TEXT NOT NULL DEFAULT 'standard';

ALTER TABLE "Exercise"
ADD COLUMN "muscle_targets" JSONB;

ALTER TABLE "MuscleHeatmap"
ADD COLUMN "muscle_subgroup" TEXT NOT NULL DEFAULT 'general';

DROP INDEX "MuscleHeatmap_user_id_muscle_group_key";
CREATE UNIQUE INDEX "MuscleHeatmap_user_id_muscle_group_muscle_subgroup_key"
ON "MuscleHeatmap"("user_id", "muscle_group", "muscle_subgroup");

DROP INDEX "MuscleHeatmap_muscle_group_idx";
CREATE INDEX "MuscleHeatmap_muscle_group_muscle_subgroup_idx"
ON "MuscleHeatmap"("muscle_group", "muscle_subgroup");
