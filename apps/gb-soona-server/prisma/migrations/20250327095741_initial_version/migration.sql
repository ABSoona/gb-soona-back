-- CreateEnum
CREATE TYPE "EnumUserNotificationPreferenceTypeField" AS ENUM ('NouvelleDemande', 'DemandeEnVisite', 'DemandeEnCommission', 'ContactBan', 'AideExpir');

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "typeField" "EnumUserNotificationPreferenceTypeField" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
