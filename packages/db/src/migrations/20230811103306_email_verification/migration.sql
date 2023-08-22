-- CreateTable
CREATE TABLE "UserEmailVerification" (
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" BIGINT NOT NULL,

    CONSTRAINT "UserEmailVerification_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailVerification_token_key" ON "UserEmailVerification"("token");

-- AddForeignKey
ALTER TABLE "UserEmailVerification" ADD CONSTRAINT "UserEmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
