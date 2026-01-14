import { z } from 'zod';

// Email validation
export const emailSchema = z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required');

// Phone validation (US format)
export const phoneSchema = z
    .string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format: (123) 456-7890')
    .min(1, 'Phone number is required');

// URL validation
export const urlSchema = z
    .string()
    .url('Please enter a valid URL (e.g., https://example.com)')
    .or(z.literal('')); // Allow empty for optional fields

// Name validation
export const nameSchema = z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters');

// Date validation - flexible format (Mon YYYY, MM/YYYY, etc.)
export const dateSchema = z.string()
    .min(1, 'Date is required')
    .max(20, 'Date too long');

// Optional date
export const optionalDateSchema = z.string().max(20, 'Date too long').optional();

// GPA validation
export const gpaSchema = z.string()
    .optional()
    .refine((val) => {
        if (!val) return true;
        const match = val.match(/^(\d+(\.\d+)?)(\/\d+(\.\d+)?)?$/);
        if (!match) return false;
        const gpa = parseFloat(match[1]);
        return gpa >= 0 && gpa <= 4.0;
    }, 'GPA must be between 0.0 and 4.0');

// Basics schema
export const basicsSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: emailSchema,
    phone: phoneSchema,
    address: z.string().max(200, 'Address too long'),
    websites: z.array(z.object({
        name: z.string().min(1, 'Website name required').max(50),
        url: urlSchema,
    })),
    separator: z.enum(['•', '|']),
});

// Work experience schema
export const workSchema = z.object({
    company: z.string().min(1, 'Company name required').max(100, 'Company name too long'),
    position: z.string().min(1, 'Position required').max(100, 'Position too long'),
    location: z.string().max(100, 'Location too long'),
    startDate: dateSchema,
    endDate: dateSchema,
    description: z.string().max(2000, 'Description too long'),
});

// Education schema
export const educationSchema = z.object({
    institution: z.string().min(1, 'Institution required').max(100, 'Institution name too long'),
    degree: z.string().min(1, 'Degree required').max(100, 'Degree too long'),
    field: z.string().max(100, 'Field too long'),
    location: z.string().max(100, 'Location too long'),
    graduationDate: dateSchema,
    gpa: gpaSchema,
    description: z.string().max(500, 'Description too long').optional(),
});

// Skill schema
export const skillSchema = z.object({
    category: z.string().min(1, 'Category name required').max(50, 'Category name too long'),
    items: z.array(z.string().min(1).max(50)).min(1, 'At least one skill required'),
});

// Project schema
export const projectSchema = z.object({
    name: z.string().min(1, 'Project name required').max(100, 'Project name too long'),
    description: z.string().max(2000, 'Description too long'),
    keywords: z.array(z.string().min(1).max(30)),
    url: urlSchema.optional(),
    urlName: z.string().max(50).optional(),
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
});

// Award schema
export const awardSchema = z.object({
    title: z.string().min(1, 'Award title required').max(100, 'Title too long'),
    awarder: z.string().max(100, 'Awarder name too long'),
    date: dateSchema,
    summary: z.string().max(500, 'Summary too long').optional(),
});

// Helper: Format phone number
export function formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return phone; // Return as-is if not 10 digits
}

// Helper: Validate and format on change
export function validateField<T>(schema: z.ZodSchema<T>, value: any): {
    isValid: boolean;
    error?: string;
    value?: T
} {
    const result = schema.safeParse(value);

    if (result.success) {
        return { isValid: true, value: result.data };
    }

    return {
        isValid: false,
        error: result.error.issues[0]?.message || 'Invalid input'
    };
}

// Helper: Get all errors for an object
export function getValidationErrors<T>(schema: z.ZodSchema<T>, value: any): Record<string, string> {
    const result = schema.safeParse(value);
    const errors: Record<string, string> = {};

    if (!result.success) {
        result.error.issues.forEach((err) => {
            const path = err.path.join('.');
            errors[path] = err.message;
        });
    }

    return errors;
}
