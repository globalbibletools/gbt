import data from '../../../data/morphology'
import { PrismaClient } from '../prisma/client';

const client = new PrismaClient();

async function run() {
	// TODO: generate migration to rename search field to name.
	// TODO: order books in morphology import so IDs are correct.
	await client.book.createMany({
		data: Object.keys(data).map((name, id) => ({ id: id + 1, name }))
	})

	await client.$disconnect()
}

run()
