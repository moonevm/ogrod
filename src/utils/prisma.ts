import {PrismaClient} from "../generated/prisma/client";
import {Connection} from "pg";
import {PrismaPg} from "@prisma/adapter-pg";

export const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE! })
})