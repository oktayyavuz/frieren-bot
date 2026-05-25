"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getTickets(serverId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    const tickets = await prisma.ticket.findMany({
      where: { guildId: serverId },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return tickets;
  } catch (error) {
    console.error("[ACTION] getTickets error:", error);
    return [];
  }
}

export async function getTicketFullDetails(ticketId: number) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
          category: true,
          guild: {
              select: {
                  id: true,
              }
          }
      }
    });

    return ticket;
  } catch (error) {
    console.error("[ACTION] getTicketFullDetails error:", error);
    return null;
  }
}
