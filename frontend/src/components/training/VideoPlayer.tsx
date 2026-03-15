import { useState } from 'react';
import { getVideosForTopic, VideoEntry } from '@/lib/videoDatabase';

interface Props { topic: string; }

export function VideoPlayer({ topic }: Props) {
    const videos = getVideosForTopic(topic);
    const [selected, setSelected] = useState<VideoEntry>(videos[0]);

    return (
        <div className='bg-gray-900 rounded-xl overflow-hidden'>
            {/* Main Video Embed */}
            <div className='aspect-video'>
                <iframe
                    width='100%'
                    height='100%'
                    src={`https://www.youtube.com/embed/${selected.videoId}?rel=0`}
                    title={selected.title}
                    allowFullScreen
                    className='rounded-t-xl'
                />
            </div>

            {/* Video Info */}
            <div className='p-4 border-b border-gray-700'>
                <h3 className='text-white font-semibold text-sm'>{selected.title}</h3>
                <p className='text-gray-400 text-xs mt-1'>
                    {selected.channel} · {selected.durationMins} min
                </p>
            </div>

            {/* Video List */}
            {videos.length > 1 && (
                <div className='p-3 space-y-2'>
                    <p className='text-gray-500 text-xs uppercase tracking-wider'>
                        More videos on this topic
                    </p>
                    {videos.map(v => (
                        <button
                            key={v.videoId}
                            onClick={() => setSelected(v)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left
                transition-colors ${selected.videoId === v.videoId
                                    ? 'bg-purple-900 border border-purple-700'
                                    : 'hover:bg-gray-800'}`}
                        >
                            <img
                                src={v.thumbnail}
                                alt={v.title}
                                className='w-16 h-10 rounded object-cover flex-shrink-0'
                            />
                            <div>
                                <p className='text-white text-xs font-medium line-clamp-2'>
                                    {v.title}
                                </p>
                                <p className='text-gray-400 text-xs'>{v.channel}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
