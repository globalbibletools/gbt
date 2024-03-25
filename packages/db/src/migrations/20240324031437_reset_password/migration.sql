-- CreateTable
CREATE TABLE "ResetPasswordToken" (
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires" BIGINT NOT NULL,

    CONSTRAINT "ResetPasswordToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordToken_userId_key" ON "ResetPasswordToken"("userId");

-- AddForeignKey
ALTER TABLE "ResetPasswordToken" ADD CONSTRAINT "ResetPasswordToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
