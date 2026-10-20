import { z } from 'zod';
import { computeTotals } from './calc';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date');

const email = z.string().trim().email('Enter a valid email address');
const optionalEmail = z.union([z.literal(''), email]);

// Draft rules cover types and size limits only, so an unfinished invoice can
// be saved. The full rules (required fields, date order, discount cap) are
// checked before sending.
export const PartyDraftSchema = z.object({
  name: z.string().trim().max(120, 'Keep it under 120 characters'),
  email: optionalEmail,
  address: z.string().max(500, 'Keep it under 500 characters'),
});

export const PartySchema = PartyDraftSchema.extend({
  name: PartyDraftSchema.shape.name.min(1, 'Name is required'),
});

const LineItemDraftSchema = z.object({
  id: z.string().min(1),
  description: z.string().trim().max(300, 'Keep it under 300 characters'),
  quantity: z
    .number({ invalid_type_error: 'Enter a quantity' })
    .finite()
    .min(0, 'Quantity cannot be negative')
    .max(1_000_000, 'Quantity is too large'),
  unitPriceCents: z
    .number({ invalid_type_error: 'Enter a price' })
    .int()
    .min(0, 'Price cannot be negative')
    .max(10_000_000_00, 'Price is too large'),
});

export const LineItemSchema = LineItemDraftSchema.extend({
  description: LineItemDraftSchema.shape.description.min(1, 'Describe the item'),
});

const CustomFieldDraftSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().max(60, 'Keep it under 60 characters'),
  value: z.string().max(300, 'Keep it under 300 characters'),
  visible: z.boolean(),
});

export const CustomFieldSchema = CustomFieldDraftSchema.extend({
  label: CustomFieldDraftSchema.shape.label.min(1, 'Add a label'),
});

/** What can be saved: the number stays required since it identifies the invoice. */
export const InvoiceDraftSchema = z.object({
  number: z.string().trim().min(1, 'Invoice number is required').max(40),
  issueDate: isoDate,
  dueDate: isoDate,
  business: PartyDraftSchema,
  customer: PartyDraftSchema,
  items: z.array(LineItemDraftSchema).max(200, 'Up to 200 line items'),
  discountCents: z.number().int().min(0, 'Discount cannot be negative'),
  taxRate: z
    .number()
    .finite()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  notes: z.string().max(2000, 'Keep notes under 2000 characters'),
  customFields: z.array(CustomFieldDraftSchema).max(30, 'Up to 30 custom fields'),
});

/** What can be sent. */
export const InvoiceInputSchema = InvoiceDraftSchema.extend({
  business: PartySchema,
  customer: PartySchema,
  items: z
    .array(LineItemSchema)
    .min(1, 'Add at least one line item')
    .max(200, 'Up to 200 line items'),
  customFields: z.array(CustomFieldSchema).max(30, 'Up to 30 custom fields'),
}).superRefine((inv, ctx) => {
  if (inv.dueDate < inv.issueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dueDate'],
      message: 'Due date cannot be before the issue date',
    });
  }
  const { subtotalCents } = computeTotals(inv);
  if (inv.discountCents > subtotalCents) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discountCents'],
      message: 'Discount cannot exceed the subtotal',
    });
  }
});

export type Party = z.infer<typeof PartySchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type CustomField = z.infer<typeof CustomFieldSchema>;
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;

export const SendInvoiceSchema = z.object({
  to: email,
  subject: z.string().trim().max(200).optional(),
  message: z.string().max(5000).optional(),
  copyToSender: z.boolean().optional(),
});
export type SendInvoiceRequest = z.infer<typeof SendInvoiceSchema>;
