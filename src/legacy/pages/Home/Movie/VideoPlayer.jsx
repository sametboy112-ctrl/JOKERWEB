import { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaRedo, FaServer, FaDownload } from "react-icons/fa";
import {
  fetchFullMovieStream,
  fetchFullTvStream,
  fetchFullMovieDownloads,
  fetchFullTvDownloads,
} from "../Fetcher";

const VideoPlayer = ({ movieId, tvId, season, episode, title }) => {
  const [stream, setStream] = useState(null);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [downloads, setDownloads] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadOptions, setDownloadOptions] = useState({ quality: "", limit: 5, sort: "seeders" });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStream(null);
    setSourceIdx(0);

    const loadStream = async () => {
      try {
        const data = tvId
          ? await fetchFullTvStream(tvId, season, episode)
          : await fetchFullMovieStream(movieId);
        if (!cancelled) setStream(data);
      } catch (streamError) {
        if (!cancelled) setError(streamError.message || "Unable to load stream sources.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStream();
    return () => {
      cancelled = true;
    };
  }, [movieId, tvId, season, episode, retryKey]);

  const retry = () => setRetryKey((key) => key + 1);

  const loadDownloads = async () => {
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      const data = tvId
        ? await fetchFullTvDownloads(tvId, season, episode, downloadOptions)
        : await fetchFullMovieDownloads(movieId, downloadOptions);
      setDownloads(data);
    } catch (downloadRequestError) {
      setDownloads([]);
      setDownloadError(downloadRequestError.message || "Unable to load downloads.");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (!movieId && !tvId) {
    return (
      <p className="p-6 text-center text-gray-400">
        This title does not have an IMDb stream ID yet.
      </p>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <FaServer className="text-gray-400 text-sm mr-1" aria-hidden="true" />
        <span className="text-sm text-gray-400 font-medium mr-2">Source:</span>
        {(stream?.sources ?? []).map((source, index) => (
          <button
            key={source.embed_url}
            type="button"
            onClick={() => setSourceIdx(index)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sourceIdx === index ? "bg-red-600 text-white shadow-md" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            {source.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
        <select aria-label="Download quality" value={downloadOptions.quality} onChange={(event) => setDownloadOptions((current) => ({ ...current, quality: event.target.value }))} className="rounded-lg bg-black/40 px-3 py-2 text-xs text-gray-300 outline-none">
          <option value="">Any quality</option>
          {['480p', '720p', '1080p', '2160p', 'CAM'].map((quality) => <option key={quality} value={quality}>{quality}</option>)}
        </select>
        <button type="button" onClick={loadDownloads} disabled={downloadLoading} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-60">
          <FaDownload aria-hidden="true" /> {downloadLoading ? "Finding downloads…" : "Download"}
        </button>
      </div>
      {(downloadError || downloads.length > 0) && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          {downloadError && <p className="text-sm text-red-300">{downloadError}</p>}
          {downloads.length > 0 && <div className="flex flex-col gap-2">{downloads.map((item, index) => {
            const magnet = item.magnet || item.magnet_url || item.magnetLink || item.url;
            return <a key={`${magnet || 'download'}-${index}`} href={magnet} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10">
              <span className="min-w-0 truncate">{item.name || item.title || item.filename || `Download ${index + 1}`}</span><span className="shrink-0 text-red-300">Magnet</span>
            </a>;
          })}</div>}
        </div>
      )}

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Loading stream sources…
          </div>
        )}
        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              <FaRedo aria-hidden="true" /> Retry
            </button>
          </div>
        )}
        {!loading && !error && stream?.sources?.[sourceIdx] && (
          <iframe
            key={stream.sources[sourceIdx].embed_url}
            src={stream.sources[sourceIdx].embed_url}
            allow="fullscreen *; picture-in-picture *; autoplay *; encrypted-media *; screen-wake-lock *;"
            allowFullScreen
            title={`${title || "Video"} stream`}
            referrerPolicy="origin"
            className="absolute inset-0 w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
};

VideoPlayer.propTypes = {
  movieId: PropTypes.string,
  tvId: PropTypes.string,
  season: PropTypes.number,
  episode: PropTypes.number,
  title: PropTypes.string,
};

export default memo(VideoPlayer);
