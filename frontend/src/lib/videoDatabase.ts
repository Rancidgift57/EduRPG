export interface VideoEntry {
    videoId: string;       // YouTube video ID (from URL)
    title: string;
    channel: string;
    durationMins: number;
    thumbnail: string;     // https://img.youtube.com/vi/{videoId}/mqdefault.jpg
}

export const VIDEO_DATABASE: Record<string, VideoEntry[]> = {

    // ── PYTHON ─────────────────────────────────────────────────────
    'python-basics': [
        {
            videoId: '_uQrJ0TkZlc', title: 'Python Tutorial - Python Full Course',
            channel: 'Programming with Mosh', durationMins: 360,
            thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/mqdefault.jpg'
        },
        {
            videoId: 'rfscVS0vtbw', title: 'Learn Python - Full Course for Beginners',
            channel: 'freeCodeCamp', durationMins: 270,
            thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/mqdefault.jpg'
        },
    ],
    'python-loops': [
        {
            videoId: 'OnDr4J2UXSA', title: 'Python For Loops - Full Tutorial',
            channel: 'Corey Schafer', durationMins: 18,
            thumbnail: 'https://img.youtube.com/vi/OnDr4J2UXSA/mqdefault.jpg'
        },
        {
            videoId: '6iF8Xb7Z3wQ', title: 'Python While Loops Explained',
            channel: 'Tech With Tim', durationMins: 12,
            thumbnail: 'https://img.youtube.com/vi/6iF8Xb7Z3wQ/mqdefault.jpg'
        },
    ],
    'python-functions': [
        {
            videoId: '9Os0o3wzS_I', title: 'Python Functions - Tutorial',
            channel: 'Corey Schafer', durationMins: 24,
            thumbnail: 'https://img.youtube.com/vi/9Os0o3wzS_I/mqdefault.jpg'
        },
    ],
    'python-oop': [
        {
            videoId: 'ZDa-Z5JzLYM', title: 'Python OOP Tutorial - Classes and Instances',
            channel: 'Corey Schafer', durationMins: 15,
            thumbnail: 'https://img.youtube.com/vi/ZDa-Z5JzLYM/mqdefault.jpg'
        },
    ],

    // ── MATHEMATICS ────────────────────────────────────────────────
    'algebra-basics': [
        {
            videoId: 'NybHckSEQBI', title: 'Algebra - Basic Algebra Lessons for Beginners',
            channel: 'TabletClass Math', durationMins: 45,
            thumbnail: 'https://img.youtube.com/vi/NybHckSEQBI/mqdefault.jpg'
        },
        {
            videoId: 'LwCRRUa8yTU', title: 'Algebra Basics - Khan Academy',
            channel: 'Khan Academy', durationMins: 10,
            thumbnail: 'https://img.youtube.com/vi/LwCRRUa8yTU/mqdefault.jpg'
        },
    ],
    'calculus': [
        {
            videoId: 'WUvTyaaNkzM', title: 'The Essence of Calculus',
            channel: '3Blue1Brown', durationMins: 17,
            thumbnail: 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg'
        },
        {
            videoId: 'HfACrKJ_Y2w', title: 'Calculus 1 Full Course',
            channel: 'freeCodeCamp', durationMins: 720,
            thumbnail: 'https://img.youtube.com/vi/HfACrKJ_Y2w/mqdefault.jpg'
        },
    ],
    'trigonometry': [
        {
            videoId: 'PUB0TaZ7bhA', title: 'Trigonometry - Full Course',
            channel: 'The Organic Chemistry Tutor', durationMins: 160,
            thumbnail: 'https://img.youtube.com/vi/PUB0TaZ7bhA/mqdefault.jpg'
        },
    ],

    // ── PHYSICS ─────────────────────────────────────────────────────
    'physics-mechanics': [
        {
            videoId: 'b1t41Q3xRM8', title: 'Physics - Basic Introduction',
            channel: 'The Organic Chemistry Tutor', durationMins: 35,
            thumbnail: 'https://img.youtube.com/vi/b1t41Q3xRM8/mqdefault.jpg'
        },
        {
            videoId: 'ZM8ECpBuQYE', title: 'Newton Laws of Motion',
            channel: 'Khan Academy', durationMins: 12,
            thumbnail: 'https://img.youtube.com/vi/ZM8ECpBuQYE/mqdefault.jpg'
        },
    ],
    'physics-electricity': [
        {
            videoId: 'ru032Mfsfig', title: 'Electricity Explained',
            channel: 'Real Engineering', durationMins: 11,
            thumbnail: 'https://img.youtube.com/vi/ru032Mfsfig/mqdefault.jpg'
        },
    ],

    // ── DATA STRUCTURES & ALGORITHMS ───────────────────────────────
    'data-structures': [
        {
            videoId: 'RBSGKlAvoiM', title: 'Data Structures - Full Course',
            channel: 'freeCodeCamp', durationMins: 480,
            thumbnail: 'https://img.youtube.com/vi/RBSGKlAvoiM/mqdefault.jpg'
        },
    ],
    'sorting-algorithms': [
        {
            videoId: 'g-PGLbMth_g', title: 'Sorting Algorithms Explained Visually',
            channel: 'CS Dojo', durationMins: 18,
            thumbnail: 'https://img.youtube.com/vi/g-PGLbMth_g/mqdefault.jpg'
        },
    ],

    // ── AI / MACHINE LEARNING ──────────────────────────────────────
    'machine-learning': [
        {
            videoId: 'GwIo3gDZCVQ', title: 'Machine Learning for Everybody',
            channel: 'freeCodeCamp', durationMins: 228,
            thumbnail: 'https://img.youtube.com/vi/GwIo3gDZCVQ/mqdefault.jpg'
        },
        {
            videoId: 'i_LwzRVP7bg', title: 'Machine Learning Full Course',
            channel: 'Simplilearn', durationMins: 480,
            thumbnail: 'https://img.youtube.com/vi/i_LwzRVP7bg/mqdefault.jpg'
        },
    ],
    'neural-networks': [
        {
            videoId: 'aircAruvnKk', title: 'But what is a neural network?',
            channel: '3Blue1Brown', durationMins: 19,
            thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg'
        },
    ],
};

// Helper function — get videos for a topic
export function getVideosForTopic(topic: string): VideoEntry[] {
    const key = topic.toLowerCase().replace(/ /g, '-');
    return VIDEO_DATABASE[key] || VIDEO_DATABASE['python-basics'];
}
