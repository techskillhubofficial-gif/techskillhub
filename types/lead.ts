export type PreferredContact =
  | "WHATSAPP"
  | "PHONE"
  | "EMAIL";

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  currentStatus: string;
  interestedProgram: string;
  careerGoal?: string;
  preferredContact: PreferredContact;
}