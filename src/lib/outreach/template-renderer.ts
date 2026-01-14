/**
 * Simple template renderer supporting {{variable}} syntax
 * Replaces {{key}} with corresponding value from vars object
 */
export function renderTemplate(
  template: string,
  vars: Record<string, any>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = vars[key]

    // If variable exists, use it; otherwise keep the placeholder
    if (value !== undefined && value !== null) {
      return String(value)
    }

    return match // Keep {{key}} if not found
  })
}

/**
 * Extract variable names from template
 * Example: "Hello {{firstName}} from {{organization}}" -> ["firstName", "organization"]
 */
export function extractTemplateVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g)
  return Array.from(matches, m => m[1])
}

/**
 * Validate that all required variables are present
 */
export function validateTemplateVariables(
  template: string,
  vars: Record<string, any>
): { valid: boolean; missing: string[] } {
  const required = extractTemplateVariables(template)
  const missing = required.filter(key => vars[key] === undefined || vars[key] === null)

  return {
    valid: missing.length === 0,
    missing,
  }
}
