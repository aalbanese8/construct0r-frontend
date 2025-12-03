import { SourceNodeData } from '../types';

/**
 * Mocks the Google Drive Picker flow.
 * In a real application, this would:
 * 1. Initialize the Google Picker API (gapi.client.drive)
 * 2. Authenticate the user via OAuth2
 * 3. Open the Google Picker UI
 * 4. Download the selected file's content
 * 5. If audio/video, send to transcription service (e.g. Gemini API)
 */
export const pickFileFromDrive = async (): Promise<Partial<SourceNodeData>> => {
  return new Promise((resolve) => {
    // Simulate network latency / user interaction time
    setTimeout(() => {
      // Mock random file selection for variety during demo
      const mockFiles = [
        {
          title: 'Q4_Marketing_Strategy.gdoc',
          text: '# Q4 Marketing Strategy\n\n## Objectives\n1. Increase brand awareness by 25%\n2. Launch 3 new product features\n3. Expand into the APAC region\n\n## Key Tactics\n- Influencer partnerships on TikTok\n- SEO optimization for the blog\n- Email drip campaigns for new signups',
          url: 'https://docs.google.com/document/d/123456789/edit',
          fileType: 'application/vnd.google-apps.document'
        },
        {
          title: 'User_Interview_Notes.pdf',
          text: 'INTERVIEW TRANSCRIPT - PARTICIPANT #42\n\nQ: How do you currently manage your workflow?\nA: It is a bit of a mess. I use three different tools.\n\nQ: What is the biggest pain point?\nA: Moving data between them manually. I waste about 2 hours a week just copying and pasting.',
          url: 'https://drive.google.com/file/d/987654321/view',
          fileType: 'application/pdf'
        },
        {
          title: 'Project_Budget_2024.gsheet',
          text: 'Item | Cost | Category\n---|---|---\nServer Costs | $5,000 | Infrastructure\nAPI Usage | $1,200 | Third-party\nDesign Assets | $500 | Creative\n\nTotal Projected: $6,700',
          url: 'https://docs.google.com/spreadsheets/d/555555555/edit',
          fileType: 'application/vnd.google-apps.spreadsheet'
        },
        {
            title: 'Product_Demo_Walkthrough.mp4',
            text: '[TRANSCRIPT GENERATED FROM VIDEO]\n\n[00:00] Narrator: Welcome to the new dashboard.\n[00:05] Narrator: As you can see, the analytics are now real-time.\n[00:12] Narrator: Click here to export your reports.\n[00:20] Narrator: And that wraps up the quick tour.',
            url: 'https://drive.google.com/file/d/video123/view',
            fileType: 'video/mp4'
        },
        {
            title: 'Brainstorming_Session_Audio.mp3',
            text: '[TRANSCRIPT GENERATED FROM AUDIO]\n\nSpeaker 1: I think we should focus on the mobile experience first.\nSpeaker 2: I agree, most of our traffic is from iOS.\nSpeaker 1: Let\'s allocate 60% of the budget there then.',
            url: 'https://drive.google.com/file/d/audio456/view',
            fileType: 'audio/mpeg'
        }
      ];

      const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];

      resolve({
        status: 'success',
        platform: 'drive',
        title: randomFile.title,
        text: randomFile.text,
        url: randomFile.url,
        fileType: randomFile.fileType
      });
    }, 2500); // Simulate processing time
  });
};