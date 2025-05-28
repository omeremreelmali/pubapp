import { prisma } from "./prisma";

export const DEFAULT_TAGS = [
  { name: "Development", color: "#10B981" }, // Green
  { name: "Testing", color: "#F59E0B" }, // Amber
  { name: "Staging", color: "#3B82F6" }, // Blue
  { name: "Production", color: "#EF4444" }, // Red
  { name: "Beta", color: "#8B5CF6" }, // Purple
  { name: "Alpha", color: "#EC4899" }, // Pink
];

export async function createDefaultTags(organizationId: string) {
  try {
    // Check if organization already has tags
    const existingTags = await prisma.tag.findMany({
      where: { organizationId },
    });

    if (existingTags.length > 0) {
      return existingTags;
    }

    // Create default tags
    const createdTags = await Promise.all(
      DEFAULT_TAGS.map((tag) =>
        prisma.tag.create({
          data: {
            name: tag.name,
            color: tag.color,
            organizationId,
          },
        })
      )
    );

    return createdTags;
  } catch (error) {
    console.error("Error creating default tags:", error);
    throw error;
  }
}
