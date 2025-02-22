/*
  Warnings:

  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[c_empleado]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `c_empleado` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `name`,
    ADD COLUMN `c_empleado` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_c_empleado_key` ON `User`(`c_empleado`);
