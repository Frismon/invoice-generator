import { z } from 'zod';
import { computeTotals } from './calc';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date');

const email = z.string().trim().email('Enter a valid email address');
const optionalEmail = z.union([z.literal(''), email]);

export const PartySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Keep it under 120 characters'),
  email: optionalEmail,
  address: z.string().max(500, 'Keep it under 500 characters'),
});

export const LineItemSchema = z.object({
  id: z.string().min(1),
  description: z
    .string()
    .trim()
    .min(1, 'Describe the item')
    .max(300, 'Keep it under 300 characters'),
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

export const CustomFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, 'Add a label').max(60, 'Keep it under 60 characters'),
  value: z.string().max(300, 'Keep it under 300 characters'),
  visible: z.boolean(),
});

export const InvoiceInputSchema = z
  .object({
    number: z.string().trim().min(1, 'Invoice number is required').max(40),
    issueDate: isoDate,
    dueDate: isoDate,
    business: PartySchema,
    customer: PartySchema,
    items: z
      .array(LineItemSchema)
      .min(1, 'Add at least one line item')
      .max(200, 'Up to 200 line items'),
    discountCents: z.number().int().min(0, 'Discount cannot be negative'),
    taxRate: z
      .number()
      .finite()
      .min(0, 'Tax rate cannot be negative')
      .max(100, 'Tax rate cannot exceed 100%'),
    notes: z.string().max(2000, 'Keep notes under 2000 characters'),
    customFields: z.array(CustomFieldSchema).max(30, 'Up to 30 custom fields'),
  })
  .superRefine((inv, ctx) => {
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
