export const STEPS = ["Screw Jack Type", "Orientation", "Head Type", "Load & Quantity", "Drive & Accessories", "Special Options", "Review & Contact"];
export const TYPES = [
  { value: "Translating Type", image: "translating-upward.webp", description: "The lifting screw moves through the jack body." },
  { value: "Rotating Type", image: "rotating-upward.webp", description: "The screw rotates and the lifting nut travels along it." },
];
export const HEADS = [
  { value: "Head 1", image: "head-1.webp" },
  { value: "Head 2", image: "" },
  { value: "Head 3", image: "head-3.webp" },
  { value: "Head 4", image: "head-4.webp" },
  { value: "Head 5", image: "head-5.webp" },
  { value: "Head 6", image: "head-6.webp" },
];
export const CAPACITIES = ["0.5", "1", "2", "2.5", "3", "5", "10", "20", "Other"];
export const ACCESSORIES = [
  { value: "Handwheel", image: "hand-wheel.webp" },
  { value: "Motor", image: "motor.webp" },
  { value: "Gearbox & Motor", image: "gearbox-and-motor.webp" },
  { value: "Coupling", image: "coupling.webp" },
  { value: "Bellows Boot", image: "bellow-boot.webp" },
  { value: "Bevel Gear Box", image: "bevel-gearbox.webp" },
];
export const SPECIAL_OPTIONS = ["Anti-rotation", "Anti-backlash"];
export type Configuration = {
  screwType: string; orientation: string; headType: string; capacity: string;
  customCapacity: string; quantity: string; stroke: string; accessories: string[];
  specialOptions: string[]; name: string; company: string; phone: string;
  email: string; notes: string; website: string;
};
export const initialConfiguration: Configuration = {
  screwType: "", orientation: "", headType: "", capacity: "", customCapacity: "",
  quantity: "1", stroke: "", accessories: [], specialOptions: [], name: "",
  company: "", phone: "", email: "", notes: "", website: "",
};
export function validateStep(step: number, data: Configuration): string | null {
  if (step === 0 && !TYPES.some(item => item.value === data.screwType)) return "Please select a screw jack type.";
  if (step === 1 && !["Upward", "Downward"].includes(data.orientation)) return "Please select a screw orientation.";
  if (step === 2 && !HEADS.some(item => item.value === data.headType)) return "Please select a head type.";
  if (step === 3) {
    if (!CAPACITIES.includes(data.capacity)) return "Please select a load capacity.";
    if (data.capacity === "Other" && (!data.customCapacity.trim() || !Number.isFinite(Number(data.customCapacity)) || Number(data.customCapacity) <= 0 || Number(data.customCapacity) > 100000)) return "Enter a custom capacity between 0 and 100,000 tons.";
    if (!Number.isInteger(Number(data.quantity)) || Number(data.quantity) < 1 || Number(data.quantity) > 100000) return "Enter a whole-number quantity between 1 and 100,000.";
    if (data.stroke && (!Number.isFinite(Number(data.stroke)) || Number(data.stroke) <= 0 || Number(data.stroke) > 1000000)) return "Enter a positive stroke length in mm, or leave it blank.";
  }
  if (step === 4 && data.accessories.some(value => !ACCESSORIES.some(item => item.value === value))) return "Select accessories from the available options.";
  if (step === 5 && data.specialOptions.some(value => !SPECIAL_OPTIONS.includes(value))) return "Select a valid special option.";
  if (step === 6) {
    if (!data.name.trim() || data.name.length > 100) return "Enter your name (up to 100 characters).";
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15 || data.phone.length > 30) return "Enter a valid mobile / WhatsApp number (10–15 digits).";
    if (data.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) || data.email.length > 120)) return "Enter a valid email address, or leave it blank.";
    if (data.company.length > 120 || data.notes.length > 1500) return "Please shorten your company name or application notes.";
  }
  return null;
}
export function summaryRows(data: Configuration) {
  return [
    ["Screw jack type", data.screwType || "Not selected"],
    ["Orientation", data.orientation ? `${data.orientation} facing` : "Not selected"],
    ["Head type", data.headType || "Not selected"],
    ["Load capacity", data.capacity ? `${data.capacity === "Other" ? data.customCapacity || "Custom" : data.capacity} ton` : "Not selected"],
    ["Quantity", data.quantity],
    ["Stroke length", data.stroke ? `${data.stroke} mm` : "To be discussed"],
    ["Drive & accessories", data.accessories.join(", ") || "None selected"],
    ["Special options", data.specialOptions.join(", ") || "Standard configuration"],
  ];
}
export function normalizeConfiguration(input: unknown): Configuration | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const source = input as Record<string, unknown>;
  const result = { ...initialConfiguration };
  for (const key of Object.keys(initialConfiguration) as (keyof Configuration)[]) {
    const value = source[key];
    if (key === "accessories" || key === "specialOptions") {
      if (!Array.isArray(value) || value.length > 10 || value.some(item => typeof item !== "string")) return null;
      result[key] = [...new Set(value as string[])];
    } else {
      if (typeof value !== "string" || value.length > (key === "notes" ? 1500 : 150)) return null;
      result[key] = value.trim();
    }
  }
  return result;
}
