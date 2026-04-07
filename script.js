/**
 * UnityHaus YouTube Fetcher
 * Fetches the latest 3 videos from a specific YouTube Playlist
 */

const API_KEY = "AIzaSyA4KztrUv_e41WIvPxU8qjkv7Dc4xpvovk";
const PLAYLIST_ID = "PLvA8svNVo_fusW9AnZ7tDQEABfg4PyN1K";
const MAX_RESULTS = 3;

// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  const videosContainer = document.getElementById("videos");

  // Check if the container exists to avoid null errors
  if (!videosContainer) {
    console.error("Error: Element with ID 'videos' not found in Index.html");
    return;
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS}&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

  fetch(apiUrl)
    .then((response) => {
      // Check if the response is successful (status 200)
      if (!response.ok) {
        throw new Error(`YouTube API returned status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.items || data.items.length === 0) {
        videosContainer.innerHTML = "<p>No videos found in this playlist.</p>";
        return;
      }

      // Clear any placeholder text
      videosContainer.innerHTML = "";

      // Loop through the video items
      data.items.forEach((item) => {
        const videoId = item.snippet.resourceId.videoId;
        const videoTitle = item.snippet.title;

        // Create a wrapper div for styling/aspect ratio
        const videoWrapper = document.createElement("div");
        videoWrapper.className = "video-wrapper";

        // Create the iframe
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = videoTitle;
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
        iframe.loading = "lazy";

        // Append iframe to wrapper, and wrapper to container
        videoWrapper.appendChild(iframe);
        videosContainer.appendChild(videoWrapper);
      });
    })
    .catch((error) => {
      console.error("YouTube API Error:", error);
      videosContainer.innerHTML = `
        <p style="grid-column: 1/-1; text-align: center; color: var(--muted);">
          Unable to load videos at this time. 
          <a href="https://www.youtube.com/@Unityhaus-Canada/videos" target="_blank" style="color: var(--mint);">
            View them directly on YouTube.
          </a>
        </p>
      `;
    });
});