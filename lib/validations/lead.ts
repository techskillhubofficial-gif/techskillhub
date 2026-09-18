import { z } from "zod";

export const LeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ENROLLED",
  "CLOSED",
]);

export const PreferredContactSchema = z.enum([
  "WHATSAPP",
  "PHONE",
  "EMAIL",
]);

export const LeadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long"),

  currentStatus: z
    .string()
    .trim()
    .min(1, "Please select your current status"),

  interestedProgram: z
    .string()
    .trim()
    .min(1, "Please select a program"),

  careerGoal: z
    .string()
    .trim()
    .optional(),

  preferredContact: PreferredContactSchema,

  status: LeadStatusSchema.optional(),

  source: z
    .string()
    .trim()
    .optional(),

  notes: z
    .string()
    .trim()
    .optional(),

  assignedTo: z
    .string()
    .trim()
    .optional(),

  closedReason: z
    .string()
    .trim()
    .optional(),
});

export const CreateLeadSchema = LeadSchema.omit({
  status: true,
});

export const UpdateLeadSchema = LeadSchema.partial();

export const LeadFollowUpSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ offset: true }),

  note: z
    .string()
    .trim()
    .max(2000, "Follow-up note is too long")
    .optional(),

  assignedTo: z
    .string()
    .trim()
    .optional(),
});

export const UpdateLeadFollowUpSchema = z.object({
  status: z.enum([
    "PENDING",
    "COMPLETED",
    "CANCELLED",
  ]),

  note: z
    .string()
    .trim()
    .max(2000, "Follow-up note is too long")
    .optional(),

  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .optional(),

  assignedTo: z
    .string()
    .trim()
    .optional(),
});

export const LeadActivitySchema = z.object({
  type: z.enum([
    "CALL",
    "WHATSAPP",
    "EMAIL",
    "UPDATED",
    "NOTE_ADDED",
    "NOTE_UPDATED",
    "ASSIGNED",
  ]),

  title: z
    .string()
    .trim()
    .min(1, "Activity title is required")
    .max(200, "Activity title is too long"),

  description: z
    .string()
    .trim()
    .max(5000, "Activity description is too long")
    .optional(),

  metadata: z
    .record(z.string(), z.unknown())
    .optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export type LeadFollowUpInput = z.infer<typeof LeadFollowUpSchema>;
export type UpdateLeadFollowUpInput = z.infer<
  typeof UpdateLeadFollowUpSchema
>;
export type LeadActivityInput = z.infer<typeof LeadActivitySchema>;