export const PILLAR_CATEGORIES = [
    'Health & Fitness',
    'Mental Health & Mindset',
    'Career / Professional Growth',
    'Finances',
    'Relationships',
    'Personal Growth',
    'Productivity & Discipline',
    'Spirituality / Purpose',
    'Lifestyle & Recreation',
] as const;

export type PillarCategory = typeof PILLAR_CATEGORIES[number];
