import { z } from "zod";

export const GoalSchema = z.object({
  summary: z.string().min(1),
  purpose: z.string().min(1),
  audience: z.string().min(1).nullable(),
  requiredSections: z.array(z.string().min(1)).min(1),
  constraints: z.array(z.string()),
  questions: z.array(z.string()),
});

export const DraftArtifactSchema = z.object({
  title: z.string().min(1),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1),
        entries: z.array(
          z.object({
            text: z.string().min(1),
            kind: z.enum(["fact", "inference", "gap"]),
            sourceIds: z.array(z.string()),
          }),
        ),
      }),
    )
    .min(1),
  gaps: z.array(z.string()),
  conflicts: z.array(
    z.object({
      description: z.string().min(1),
      sourceIds: z.array(z.string()),
    }),
  ),
  assumptions: z.array(z.string()),
});
