import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const products = await prisma.product.findMany({
    include: { cleanProduct: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}
