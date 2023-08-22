-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL DEFAULT generate_ulid(),
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSystemRole" (
    "userId" UUID NOT NULL,
    "role" "SystemRole" NOT NULL,

    CONSTRAINT "UserSystemRole_pkey" PRIMARY KEY ("userId","role")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSystemRole" ADD CONSTRAINT "UserSystemRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
