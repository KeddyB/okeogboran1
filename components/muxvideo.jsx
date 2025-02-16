'use client'

import MuxPlayer from '@mux/mux-player-react'

export function MuxVideo({playbackId, title}) {
  if (!playbackId) return null

  return <MuxPlayer playbackId={playbackId} metadata={title ? {video_title: title} : undefined} />
}