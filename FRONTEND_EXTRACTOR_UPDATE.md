# Frontend Extractor Service Update

Replace your current `services/extractor.ts` file with this updated version that connects to your backend API:

```typescript
// services/extractor.ts
import { SourceNodeData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get auth token from localStorage or your auth context
 */
const getAuthToken = (): string => {
  const user = localStorage.getItem('constructor_user');
  if (!user) {
    throw new Error('User not authenticated');
  }

  // You'll need to store the access token in localStorage
  // This is a simplified example - use your auth context instead
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found');
  }

  return token;
};

/**
 * Detect platform from URL
 */
const detectPlatform = (url: string): SourceNodeData['platform'] => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com/p/') ||
      url.includes('instagram.com/reel/') ||
      url.includes('instagram.com/reels/')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  return 'web';
};

/**
 * Extract content from various sources using the backend API
 */
export const extractContent = async (
  url: string,
  type: 'video' | 'web'
): Promise<Partial<SourceNodeData>> => {
  if (!url) {
    return { status: 'error', errorMessage: 'URL is required' };
  }

  try {
    const token = getAuthToken();
    const platform = detectPlatform(url);

    // For video platforms (YouTube, Instagram), use transcribe endpoint
    if (platform === 'youtube' || platform === 'instagram') {
      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract content');
      }

      const data = await response.json();

      return {
        status: 'success',
        platform: data.platform,
        title: data.title,
        text: data.text,
        url: data.url,
      };
    }

    // For web pages, use scrape endpoint
    if (platform === 'web') {
      const response = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape content');
      }

      const data = await response.json();

      return {
        status: 'success',
        platform: 'web',
        title: data.title,
        text: data.text,
        url: data.url,
      };
    }

    // TikTok not yet supported
    if (platform === 'tiktok') {
      throw new Error('TikTok support coming soon');
    }

    return {
      status: 'error',
      errorMessage: 'Unsupported platform',
    };
  } catch (error) {
    console.error('Extraction error:', error);

    return {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
```

## Update Your Video/Web Node Components

Update the source nodes to use the new extractor:

```typescript
// components/nodes/SourceNodes.tsx (partial update)

const handleExtract = async () => {
  if (!data.url) {
    updateNodeData(id, {
      status: 'error',
      errorMessage: 'Please enter a URL',
    });
    return;
  }

  updateNodeData(id, { status: 'loading' });

  try {
    const result = await extractContent(data.url, 'video'); // or 'web'

    if (result.status === 'error') {
      updateNodeData(id, {
        status: 'error',
        errorMessage: result.errorMessage,
      });
    } else {
      updateNodeData(id, {
        ...result,
        status: 'success',
      });
    }
  } catch (error) {
    updateNodeData(id, {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Extraction failed',
    });
  }
};
```

## Environment Variables

Add to your frontend `.env` file:

```env
VITE_API_URL=http://localhost:3001
```

For production:

```env
VITE_API_URL=https://your-backend-domain.com
```

## Supported URLs

After implementing the backend and updating the frontend, your app will support:

### YouTube
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

### Instagram
- `https://www.instagram.com/p/POST_ID/`
- `https://www.instagram.com/reel/REEL_ID/`
- `https://www.instagram.com/reels/REEL_ID/`

### Web Pages
- Any valid HTTP/HTTPS URL with readable content

## Error Handling

The extractor now provides detailed error messages:

```typescript
if (result.status === 'error') {
  // Show error to user
  console.error('Extraction failed:', result.errorMessage);

  // Possible errors:
  // - "User not authenticated"
  // - "No access token found"
  // - "Invalid or expired token"
  // - "Failed to extract content"
  // - "Platform not yet supported"
  // - "Instagram download failed: [reason]"
  // - "YouTube transcription failed: [reason]"
}
```

## Loading States

The extractor properly handles loading states:

1. User enters URL
2. Status changes to `'loading'`
3. Backend processes the request
4. Status changes to `'success'` or `'error'`

You can show loading indicators based on the `status` field.

## Rate Limiting Considerations

Instagram may rate-limit requests. Consider:

1. **Caching**: Store previously extracted content
2. **Debouncing**: Wait for user to finish typing before extracting
3. **User feedback**: Show clear error messages when rate-limited

Example caching implementation:

```typescript
const cache = new Map<string, Partial<SourceNodeData>>();

export const extractContent = async (
  url: string,
  type: 'video' | 'web'
): Promise<Partial<SourceNodeData>> => {
  // Check cache first
  if (cache.has(url)) {
    return cache.get(url)!;
  }

  // ... extraction logic ...

  if (result.status === 'success') {
    cache.set(url, result);
  }

  return result;
};
```

## Testing

Test with these sample URLs:

### YouTube (Public)
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Instagram (Public Post)
```
https://www.instagram.com/p/EXAMPLE_POST_ID/
```

Note: Make sure to test with actual public Instagram posts!

---

**Next Steps:**
1. Update your auth service to store access tokens in localStorage
2. Replace the mock extractor service with this version
3. Test with various URLs
4. Implement proper error handling UI
5. Add loading indicators
6. Consider adding retry logic for failed requests
