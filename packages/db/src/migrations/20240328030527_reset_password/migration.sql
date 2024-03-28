-- CreateTable
CREATE TABLE "ResetPasswordToken" (
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires" BIGINT NOT NULL,

    CONSTRAINT "ResetPasswordToken_pkey" PRIMARY KEY ("token")
);

-- AddForeignKey
ALTER TABLE "ResetPasswordToken" ADD CONSTRAINT "ResetPasswordToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
