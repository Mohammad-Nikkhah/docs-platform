import { createLowlight, common } from "lowlight";
import dockerfile from "highlight.js/lib/languages/dockerfile";

export const CODE_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "dockerfile", label: "Dockerfile" },
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]["value"];

export const lowlight = createLowlight(common);
lowlight.register({ dockerfile });
lowlight.registerAlias({ xml: ["html"] });

export function languageLabel(lang: string | null | undefined): string {
  return CODE_LANGUAGES.find((l) => l.value === lang)?.label ?? "Text";
}
