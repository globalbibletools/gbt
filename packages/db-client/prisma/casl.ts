/* eslint-disable @typescript-eslint/no-explicit-any */

// This code comes from https://casl.js.org/v6/en/package/casl-prisma#custom-prisma-client-output-path
// and is necessary for casl to support generating the prisma client in a custom directory.

import {
  createAbilityFactory,
  createAccessibleByFactory,
  ExtractModelName,
  Model,
} from '@casl/prisma/runtime';
import { hkt } from '@casl/ability';
import type { Prisma, PrismaClient } from './client';

type ModelName = Prisma.ModelName;
type ModelWhereInput = {
  [K in Prisma.ModelName]: Uncapitalize<K> extends keyof PrismaClient
    ? Extract<
        Parameters<PrismaClient[Uncapitalize<K>]['findFirst']>[0],
        { where?: any }
      >['where']
    : never;
};

type WhereInput<TModelName extends Prisma.ModelName> = Extract<
  ModelWhereInput[TModelName],
  Record<any, any>
>;

interface PrismaQueryTypeFactory extends hkt.GenericFactory {
  produce: WhereInput<ExtractModelName<this[0], ModelName>>;
}

type PrismaModel = Model<Record<string, any>, string>;
// Higher Order type that allows to infer passed in Prisma Model name
export type PrismaQuery<T extends PrismaModel = PrismaModel> = WhereInput<
  ExtractModelName<T, ModelName>
> &
  hkt.Container<PrismaQueryTypeFactory>;

type WhereInputPerModel = {
  [K in ModelName]: WhereInput<K>;
};

const createPrismaAbility = createAbilityFactory<ModelName, PrismaQuery>();
const accessibleBy = createAccessibleByFactory<
  WhereInputPerModel,
  PrismaQuery
>();

export { createPrismaAbility, accessibleBy };
