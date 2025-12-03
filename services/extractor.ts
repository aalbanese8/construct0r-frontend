import { SourceNodeData } from '../types';
import { contentAPI } from './api';

/**
 * Extract content from YouTube, Instagram, or web pages using the backend API
 */
export const extractContent = async (url: string, type: 'video' | 'web'): Promise<Partial<SourceNodeData>> => {
  if (!url) {
    return { status: 'error', errorMessage: 'URL is required' };
  }

  try {
    console.log('Extracting content from:', url);

    // Detect platform
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isInstagram = url.includes('instagram.com/p/') ||
                       url.includes('instagram.com/reel/') ||
                       url.includes('instagram.com/reels/');
    const isTikTok = url.includes('tiktok.com');

    // For video platforms (YouTube, Instagram, TikTok), use transcribe endpoint
    if (isYouTube || isInstagram || isTikTok) {
      const response = await contentAPI.transcribe(url);

      console.log('Transcription response:', response);

      return {
        status: 'success',
        text: response.text,
        title: response.title,
        platform: response.platform as SourceNodeData['platform'],
        url,
      };
    }

    // For regular web pages, use scrape endpoint
    const response = await contentAPI.scrape(url);

    console.log('Scrape response:', response);

    return {
      status: 'success',
      text: response.text,
      title: response.title,
      platform: 'web',
      url,
    };

  } catch (error) {
    console.error('Extraction error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to extract content';

    return {
      status: 'error',
      errorMessage,
    };
  }
};
