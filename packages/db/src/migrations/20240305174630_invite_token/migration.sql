-- CreateTable
CREATE TABLE "UserInvitation" (
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires" BIGINT NOT NULL,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_userId_key" ON "UserInvitation"("userId");

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
