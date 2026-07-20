export interface AudioWaveformOptions {
  /** Number of peak samples generated per channel. @default 96 */
  sampleCount?: number;
  /** Scales the loudest peak to 1 for a reference waveform. @default false */
  normalize?: boolean;
}

/** One channel of an {@link AudioPeakStore}: per-bucket true minima, maxima,
 *  and RMS energy — the three series an NLE-style waveform draws from. */
export interface AudioPeakChannel {
  min: Float32Array;
  max: Float32Array;
  rms: Float32Array;
}

/** High-resolution peak data reduced from decoded PCM, analogous to the peak
 *  files editors like Premiere Pro build alongside imported audio. The
 *  timeline resamples it to one column per rendered pixel, so waveforms stay
 *  detail-accurate at any clip width or trim. */
export interface AudioPeakStore {
  channels: AudioPeakChannel[];
  bucketCount: number;
  /** Source duration in milliseconds. */
  duration: number;
}

export interface AudioPeakStoreOptions {
  /** Peak buckets computed per second of audio (≈5ms windows at 200). @default 200 */
  bucketsPerSecond?: number;
}

/** Reduces decoded PCM into a per-channel min/max/RMS peak store. */
export function createAudioPeakStore(
  audioBuffer: AudioBuffer,
  options?: AudioPeakStoreOptions
): AudioPeakStore {
  const bucketsPerSecond = Math.min(
    1000,
    Math.max(10, Math.round(options?.bucketsPerSecond ?? 200))
  );
  const bucketCount = Math.max(1, Math.ceil(audioBuffer.duration * bucketsPerSecond));
  const samplesPerBucket = audioBuffer.length / bucketCount;

  const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, channelIndex) => {
    const samples = audioBuffer.getChannelData(channelIndex);
    const min = new Float32Array(bucketCount);
    const max = new Float32Array(bucketCount);
    const rms = new Float32Array(bucketCount);

    for (let bucket = 0; bucket < bucketCount; bucket += 1) {
      const start = Math.floor(bucket * samplesPerBucket);
      const end = Math.min(
        samples.length,
        Math.max(start + 1, Math.floor((bucket + 1) * samplesPerBucket))
      );
      let bucketMin = Infinity;
      let bucketMax = -Infinity;
      let sumSquares = 0;
      for (let index = start; index < end; index += 1) {
        const sample = samples[index];
        if (sample < bucketMin) bucketMin = sample;
        if (sample > bucketMax) bucketMax = sample;
        sumSquares += sample * sample;
      }
      min[bucket] = bucketMin === Infinity ? 0 : Math.max(-1, bucketMin);
      max[bucket] = bucketMax === -Infinity ? 0 : Math.min(1, bucketMax);
      rms[bucket] = Math.min(1, Math.sqrt(sumSquares / (end - start)));
    }

    return { min, max, rms };
  });

  return { channels, bucketCount, duration: audioBuffer.duration * 1000 };
}

function resolveOptions(options: number | AudioWaveformOptions | undefined) {
  const requestedCount = typeof options === 'number' ? options : (options?.sampleCount ?? 96);
  return {
    sampleCount: Math.min(
      512,
      Math.max(1, Number.isFinite(requestedCount) ? Math.round(requestedCount) : 96)
    ),
    normalize: typeof options === 'number' ? false : (options?.normalize ?? false),
  };
}

function channelPeaks(channel: Float32Array, sampleCount: number) {
  const peaks = Array.from({ length: sampleCount }, () => 0);

  for (let peakIndex = 0; peakIndex < sampleCount; peakIndex += 1) {
    const start = Math.floor((peakIndex / sampleCount) * channel.length);
    const end = Math.min(
      channel.length,
      Math.max(start + 1, Math.floor(((peakIndex + 1) / sampleCount) * channel.length))
    );
    let peak = 0;
    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      peak = Math.max(peak, Math.abs(channel[sampleIndex] ?? 0));
    }
    peaks[peakIndex] = Math.round(Math.min(1, peak) * 1000) / 1000;
  }

  return peaks;
}

/** Reduces decoded PCM audio into channel-accurate peak amplitudes from 0–1. */
export function createAudioWaveformChannels(
  audioBuffer: AudioBuffer,
  options?: number | AudioWaveformOptions
) {
  const resolved = resolveOptions(options);
  const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, channelIndex) =>
    channelPeaks(audioBuffer.getChannelData(channelIndex), resolved.sampleCount)
  );

  if (!resolved.normalize) return channels;
  const maximum = Math.max(0, ...channels.flat());
  if (maximum <= 0) return channels;
  return channels.map((channel) =>
    channel.map((peak) => Math.round(Math.min(1, peak / maximum) * 1000) / 1000)
  );
}

/** Creates one peak envelope by combining the loudest value from each audio channel. */
export function createAudioWaveform(
  audioBuffer: AudioBuffer,
  options?: number | AudioWaveformOptions
) {
  const channels = createAudioWaveformChannels(audioBuffer, options);
  const sampleCount = channels[0]?.length ?? 0;
  return Array.from({ length: sampleCount }, (_, index) =>
    Math.max(...channels.map((channel) => channel[index] ?? 0))
  );
}
