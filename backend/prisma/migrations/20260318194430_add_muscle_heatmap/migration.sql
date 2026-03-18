/*
  Warnings:

  - The `muscle_groups` column on the `Exercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('chest', 'back', 'legs', 'shoulders', 'arms', 'core');

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "muscle_groups",
ADD COLUMN     "muscle_groups" "MuscleGroup"[];

-- CreateTable
CREATE TABLE "MuscleHeatmap" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "muscle_group" "MuscleGroup" NOT NULL,
    "fatigue_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MuscleHeatmap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MuscleHeatmap_user_id_idx" ON "MuscleHeatmap"("user_id");

-- CreateIndex
CREATE INDEX "MuscleHeatmap_muscle_group_idx" ON "MuscleHeatmap"("muscle_group");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleHeatmap_user_id_muscle_group_key" ON "MuscleHeatmap"("user_id", "muscle_group");

-- CreateIndex
CREATE INDEX "ExerciseLog_session_id_idx" ON "ExerciseLog"("session_id");

-- AddForeignKey
ALTER TABLE "MuscleHeatmap" ADD CONSTRAINT "MuscleHeatmap_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
