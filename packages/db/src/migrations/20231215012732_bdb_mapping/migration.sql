-- AlterTable
CREATE SEQUENCE bdbstrongsmapping_id_seq;
ALTER TABLE "BDBStrongsMapping" ALTER COLUMN "id" SET DEFAULT nextval('bdbstrongsmapping_id_seq');
ALTER SEQUENCE bdbstrongsmapping_id_seq OWNED BY "BDBStrongsMapping"."id";
