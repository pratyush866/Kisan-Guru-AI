export const CATEGORIES = [
  { id: 'disease', label: 'Disease Diagnosis', icon: 'shield-alert', color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
  { id: 'pest', label: 'Pest Control', icon: 'bug', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
  { id: 'fertilizer', label: 'Fertilizer Recommendation', icon: 'flask-conical', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
  { id: 'irrigation', label: 'Irrigation Planning', icon: 'droplet', color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' },
  { id: 'crop', label: 'Crop Management', icon: 'sprout', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  { id: 'weather', label: 'Weather Advice', icon: 'cloud-sun', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
  { id: 'schemes', label: 'Government Schemes', icon: 'landmark', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
  { id: 'market', label: 'Market Guidance', icon: 'trending-up', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
  { id: 'organic', label: 'Organic Farming', icon: 'leaf', color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
  { id: 'modern', label: 'Modern Farming', icon: 'cpu', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
  { id: 'equipment', label: 'Equipment Suggestions', icon: 'wrench', color: 'text-slate-500 bg-slate-50 dark:bg-slate-950/20' },
  { id: 'livestock', label: 'Livestock Support', icon: 'cow', color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' },
  { id: 'financial', label: 'Financial Planning', icon: 'wallet', color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
  { id: 'insurance', label: 'Insurance Information', icon: 'file-text', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' }
];

export class CategoryModel {
  static getAll() {
    return CATEGORIES;
  }

  static getById(id) {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES[4]; // Default to Crop Management
  }
}
