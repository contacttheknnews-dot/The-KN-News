import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Click-through tracker for direct-sold advertisements.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adId = Number(id);
  if (!Number.isInteger(adId)) {
    return NextResponse.redirect(new URL("/", _req.url));
  }
  const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
  if (!ad) return NextResponse.redirect(new URL("/", _req.url));
  await prisma.advertisement
    .update({ where: { id: adId }, data: { clicks: { increment: 1 } } })
    .catch(() => {});
  return NextResponse.redirect(ad.url);
}
