/**
 * Sanitize a Handlebars template string before compilation.
 *
 * Handlebars does NOT support JavaScript bracket-notation like:
 *   {{obj['Key With Spaces']}}
 *
 * This function converts bracket notation to dot notation with
 * sanitized keys (spaces/special chars → underscores), matching
 * the key sanitization done in the Google Form webhook route.
 *
 * Examples:
 *   {{googleForm.responses['Full Name']}}  →  {{googleForm.responses.Full_Name}}
 *   {{googleForm.responses["Email"]}}      →  {{googleForm.responses.Email}}
 */
export function sanitizeTemplate(template: string): string {
    // Match ['...'] or ["..."] bracket access inside {{ }} expressions
    return template.replace(
        /\[['"]([^'"]+)['"]\]/g,
        (_match, key: string) => {
            const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_');
            return `.${sanitizedKey}`;
        },
    );
}
