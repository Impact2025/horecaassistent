const HEYGEN_API_BASE = 'https://api.heygen.com'

type HeygenRenderPayload = {
  avatarId: string
  script: string
  voiceId?: string
}

type HeygenRenderResponse = {
  data: { video_id: string }
}

type HeygenStatusResponse = {
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    video_url?: string
  }
}

export async function renderHeygenVideo(payload: HeygenRenderPayload): Promise<string> {
  const body = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: payload.avatarId,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: payload.script,
          voice_id: payload.voiceId ?? 'en-US-JennyNeural',
        },
      },
    ],
    dimension: { width: 1280, height: 720 },
  }

  const res = await fetch(`${HEYGEN_API_BASE}/v2/video/generate`, {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`HeyGen render fout: ${res.status}`)
  }

  const data = (await res.json()) as HeygenRenderResponse
  return data.data.video_id
}

export async function getHeygenVideoStatus(videoId: string): Promise<HeygenStatusResponse['data']> {
  const res = await fetch(
    `${HEYGEN_API_BASE}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
    {
      headers: { 'X-Api-Key': process.env.HEYGEN_API_KEY! },
    }
  )

  if (!res.ok) {
    throw new Error(`HeyGen status fout: ${res.status}`)
  }

  const json = (await res.json()) as HeygenStatusResponse
  return json.data
}

export const HEYGEN_PRESET_AVATARS = [
  {
    id: 'Anna_public_3_20240108',
    name: 'Anna',
    previewUrl:
      'https://files.heygen.ai/avatar/v3/Anna_public_3_20240108/preview_target.webp',
  },
  {
    id: 'Tyler-incasualsuit-20220722',
    name: 'Tyler',
    previewUrl:
      'https://files.heygen.ai/avatar/v3/Tyler-incasualsuit-20220722/preview_target.webp',
  },
  {
    id: 'Susan_public_2_20240328',
    name: 'Susan',
    previewUrl:
      'https://files.heygen.ai/avatar/v3/Susan_public_2_20240328/preview_target.webp',
  },
  {
    id: 'Daisy-inskirt-20220818',
    name: 'Daisy',
    previewUrl:
      'https://files.heygen.ai/avatar/v3/Daisy-inskirt-20220818/preview_target.webp',
  },
]
