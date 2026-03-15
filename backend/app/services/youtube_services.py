import httpx

YOUTUBE_API_KEY = settings.YOUTUBE_API_KEY
SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

class YouTubeService:
    async def search_topic_videos(
        self, topic: str, max_results: int = 4
    ) -> list[dict]:
        params = {
            'part': 'snippet',
            'q': f'{topic} tutorial explained',
            'type': 'video',
            'videoDuration': 'medium',
            'relevanceLanguage': 'en',
            'maxResults': max_results,
            'key': YOUTUBE_API_KEY
        }
        async with httpx.AsyncClient() as client:
            r = await client.get(SEARCH_URL, params=params)
            items = r.json().get('items', [])
            return [
                {
                    'video_id': i['id']['videoId'],
                    'title': i['snippet']['title'],
                    'thumbnail': i['snippet']['thumbnails']['medium']['url'],
                    'channel': i['snippet']['channelTitle'],
                }
                for i in items
            ]
